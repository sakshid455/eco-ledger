/**
 * @fileOverview Institutional Ledger Service (Flat Schema Implementation)
 * Orchestrates cryptographically secured operations for land assets and tokens.
 */

import { Firestore, collection, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { computeHash, encryptData, signData } from '@/lib/crypto';

export class LedgerService {
  constructor(private db: Firestore, private userId: string) {}

  /**
   * LAND REGISTRATION SERVICE
   */
  async registerLandAsset(formData: any) {
    const landId = "LND_" + Math.random().toString(36).substr(2, 9);
    const landRef = doc(this.db, "lands", landId);

    const integrityString = `${formData.surveyNumber}|${formData.name}|${formData.area}|${formData.location}`;
    const integrityHash = await computeHash(integrityString);

    const data = {
      id: landId,
      name: formData.name,
      ownerId: this.userId,
      location: formData.location,
      area: parseFloat(formData.area),
      areaUnit: formData.areaUnit || "acres",
      soilType: formData.soilType || "unknown",
      vegetation: formData.vegetation || "unknown",
      latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0,
      images: formData.imageUrl ? [formData.imageUrl] : [],
      integrityHash: integrityHash,
      status: formData.status || "PENDING", // Allow override for bootstrap logic
      createdAt: serverTimestamp(),
    };

    setDocumentNonBlocking(landRef, data, { merge: true });
    await this.logAuditEvent('LAND_REGISTERED', 'Land', landId, data);
    
    await this.createNotification(this.userId, "Land Registered", `Your land '${formData.name}' is now ${data.status}.`);
    
    return landId;
  }

  /**
   * LAND VERIFICATION SERVICE
   */
  async verifyLandAsset(params: any) {
    const landRef = doc(this.db, "lands", params.parcelId);
    
    const verificationId = "VER_" + Math.random().toString(36).substr(2, 9);
    const verRef = doc(this.db, "land_verifications", verificationId);

    const verData = {
      id: verificationId,
      landId: params.parcelId,
      adminId: this.userId,
      status: params.status,
      remarks: params.notes,
      verifiedAt: serverTimestamp()
    };

    setDocumentNonBlocking(verRef, verData, { merge: true });
    
    const updateData: any = {
      status: params.status,
      verifiedAt: serverTimestamp(),
      verifiedBy: this.userId
    };

    // PROTOCOL: If approved, sign the integrity hash to create an immutable proof
    if (params.status === 'APPROVED' && params.privateKey) {
      try {
        const landSnap = await getDoc(landRef);
        if (landSnap.exists()) {
          const integrityHash = landSnap.data().integrityHash;
          if (integrityHash) {
            const signature = await signData(integrityHash, params.privateKey);
            updateData.authoritySignature = signature;
            updateData.authorityPublicKey = params.authorityPublicKey;
          }
        }
      } catch (e) {
        console.error("[Security] RSA Signing failed during verification", e);
      }
    }

    await updateDocumentNonBlocking(landRef, updateData);

    await this.logAuditEvent('LAND_VERIFIED', 'Land', params.parcelId, verData);
    
    if (params.status === 'APPROVED' && params.landownerId) {
      await this.initializeCarbonProject(params.parcelId, params.landownerId);
    }
  }

  private async initializeCarbonProject(landId: string, ownerId: string) {
    const projectId = "PRJ_" + Math.random().toString(36).substr(2, 9);
    const projectRef = doc(this.db, "carbon_projects", projectId);
    
    const projectData = {
      id: projectId,
      landId: landId,
      ownerId: ownerId,
      projectType: "afforestation",
      carbonPotential: 120,
      carbonUnit: "tons/year",
      status: "ACTIVE",
      createdAt: serverTimestamp()
    };

    setDocumentNonBlocking(projectRef, projectData, { merge: true });
  }

  /**
   * TOKEN ISSUANCE SERVICE
   */
  async issueTokens(params: any) {
    const tokenId = "TKN_" + Math.random().toString(36).substr(2, 9);
    const collectionName = params.tokenType === 'investment' ? "investments" : "carbon_credits";
    const tokenRef = doc(this.db, collectionName, tokenId);

    // Create unique issuance hash
    const issuanceHash = await computeHash(`${params.parcelId}|${params.symbol}|${params.totalUnits}|${Date.now()}`);
    
    let signature = null;
    if (params.privateKey) {
      try {
        signature = await signData(issuanceHash, params.privateKey);
      } catch (e) {
        console.error("[Security] Token signing failed", e);
      }
    }

    const data = {
      id: tokenId,
      landId: params.parcelId,
      landownerId: this.userId,
      symbol: params.symbol?.toUpperCase() || "TKN",
      amount: parseFloat(params.totalUnits),
      status: "ACTIVE",
      createdAt: serverTimestamp(),
      unitValue: params.unitValue ? await encryptData(params.unitValue) : null,
      issuanceHash: issuanceHash,
      issuanceSignature: signature,
      issuerIdentity: params.publicIdentity || null
    };

    setDocumentNonBlocking(tokenRef, data, { merge: true });
    await this.logAuditEvent('TOKEN_ISSUED', 'Token', tokenId, data);
    return tokenId;
  }

  /**
   * TRANSACTION SETTLEMENT SERVICE
   */
  async settleTransaction(params: any) {
    const txId = "TX_" + Math.random().toString(36).substr(2, 9);
    const txRef = doc(this.db, "transactions", txId);

    const data = {
      id: txId,
      buyerId: this.userId,
      sellerId: params.token?.landownerId || "NETWORK_RESERVE",
      fromUser: this.userId, // legacy fallback
      toUser: params.token?.landownerId || "NETWORK_RESERVE", // legacy fallback
      tokenId: params.token?.id || "SYSTEM",
      tokenType: params.tokenType,
      amount: params.amount,
      totalPrice: await encryptData(params.price * params.amount),
      status: "SUCCESS",
      createdAt: serverTimestamp(),
      transactionDate: serverTimestamp(),
      transactionHash: await computeHash(txId + Date.now().toString())
    };

    setDocumentNonBlocking(txRef, data, { merge: true });
    await this.logAuditEvent('TRANSACTION_SETTLED', 'Transaction', txId, data);
    return txId;
  }

  /**
   * CARBON AUDIT SERVICE
   */
  async recordCarbonEstimate(parcelId: string, estimate: any) {
    const estId = "EST_" + Math.random().toString(36).substr(2, 9);
    const estRef = doc(this.db, "carbon_estimates", estId);
    
    const data = {
      id: estId,
      landParcelId: parcelId,
      landownerId: this.userId,
      estimatedCarbonTonnes: estimate.carbonSequestrationPotentialTonsPerYear,
      status: "CALCULATED",
      estimationDate: serverTimestamp(),
    };

    setDocumentNonBlocking(estRef, data, { merge: true });
    await this.logAuditEvent('CARBON_ESTIMATED', 'CarbonEstimate', estId, data);
  }

  async verifyCarbonEstimate(params: any) {
    const estRef = doc(this.db, "carbon_estimates", params.estimateId);
    await updateDocumentNonBlocking(estRef, {
      status: "VERIFIED",
      verifiedTonnes: params.verifiedTonnes,
      verifiedAt: serverTimestamp(),
      verifiedBy: this.userId
    });
  }

  /**
   * STATE ANCHORING SERVICE
   */
  async anchorLedgerState(params: { rootHash: string, logCount: number }) {
    const anchorId = "ANC_" + Math.random().toString(36).substr(2, 9);
    const anchorRef = doc(this.db, "merkleTreeRoots", anchorId);
    
    const data = {
      id: anchorId,
      rootHash: params.rootHash,
      logCount: params.logCount,
      creationDate: serverTimestamp(),
      anchoredBy: this.userId
    };

    setDocumentNonBlocking(anchorRef, data, { merge: true });
    await this.logAuditEvent('LEDGER_ANCHORED', 'MerkleRoot', anchorId, data);
  }

  async deleteLandAsset(landId: string) {
    const landRef = doc(this.db, "lands", landId);
    deleteDocumentNonBlocking(landRef);
  }

  private async createNotification(userId: string, title: string, message: string) {
    const nId = "NOT_" + Math.random().toString(36).substr(2, 9);
    setDocumentNonBlocking(doc(this.db, "notifications", nId), {
      id: nId,
      userId,
      title,
      message,
      read: false,
      createdAt: serverTimestamp()
    }, { merge: true });
  }

  private async logAuditEvent(type: string, entityType: string, entityId: string, payload: any) {
    addDocumentNonBlocking(collection(this.db, "auditLogs"), {
      timestamp: serverTimestamp(),
      userId: this.userId,
      eventType: type,
      entityType: entityType,
      entityId: entityId,
      eventHash: await computeHash(payload)
    });
  }
}
