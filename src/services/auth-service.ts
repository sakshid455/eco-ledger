/**
 * @fileOverview Authentication Layer Service
 * Handles institutional credential validation and role retrieval.
 */

import { 
  Firestore, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit
} from 'firebase/firestore';
import { hashPassword } from '@/lib/crypto';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export class AuthService {
  constructor(private db: Firestore) {}

  /**
   * AUTHENTICATION: Validate user credentials
   */
  async authenticate(email: string, passwordPlain: string): Promise<any> {
    const usersRef = collection(this.db, 'users');
    const q = query(usersRef, where('email', '==', email), limit(1));
    
    try {
      const snap = await getDocs(q);

      if (snap.empty) {
        throw new Error("Identity not found in the public registry.");
      }

      const userData = snap.docs[0].data();
      const salt = userData.salt;

      if (!salt) {
        throw new Error("Node protocol mismatch: Salt not found.");
      }

      const computedHash = await hashPassword(passwordPlain, salt);

      if (computedHash !== userData.password_hash) {
        throw new Error("Invalid access key for this node.");
      }

      return userData;
    } catch (e: any) {
      if (e.code === 'permission-denied' || e.message?.includes('permissions')) {
        const error = new FirestorePermissionError({
          path: 'users',
          operation: 'list'
        });
        errorEmitter.emit('permission-error', error);
      }
      throw e;
    }
  }

  /**
   * AUTHORIZATION: Retrieve user role for RBAC
   */
  async getUserRole(userId: string): Promise<string> {
    if (!userId) throw new Error("Security Violation: Missing session identifier.");

    const userRef = doc(this.db, 'users', userId);
    
    try {
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error("Authorization failed: Node identity missing or revoked.");
      }

      const data = userSnap.data();
      
      if (data.protocol !== "RSA-4096 + SHA-256 (v4.2)") {
        console.warn(`[Security] Node ${userId} using outdated protocol.`);
      }

      return data.role;
    } catch (e: any) {
      if (e.code === 'permission-denied' || e.message?.includes('permissions')) {
        const error = new FirestorePermissionError({
          path: `users/${userId}`,
          operation: 'get'
        });
        errorEmitter.emit('permission-error', error);
      }
      throw e;
    }
  }
}