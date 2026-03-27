/**
 * @fileOverview API Gateway Layer
 * Entry point for institutional requests. Handles validation, 
 * authentication, and Role-Based Access Control (RBAC).
 * Now includes Network Security measures like Rate Limiting.
 */

import { Firestore } from 'firebase/firestore';
import { LedgerService } from './ledger-service';
import { AuthService } from './auth-service';

export type ActionType = 
  | 'REGISTER_LAND' 
  | 'ISSUE_TOKENS' 
  | 'SETTLE_TRANSACTION' 
  | 'VERIFY_LAND' 
  | 'VERIFY_CARBON'
  | 'RECORD_ESTIMATE'
  | 'GENERATE_CERTIFICATE'
  | 'ANCHOR_LEDGER'
  | 'DELETE_LAND';

// Simple in-memory rate limiter for the session
const requestLog: Record<string, number[]> = {};
const RATE_LIMIT = 50; // Higher limit for institutional demos
const WINDOW_MS = 60000; // per 1 minute

export class ApiGateway {
  private ledger: LedgerService;
  private auth: AuthService;

  private permissions: Record<ActionType, string[]> = {
    'REGISTER_LAND': ['landowner', 'admin', 'investor'], // Added investor for bootstrap authority
    'ISSUE_TOKENS': ['landowner', 'admin'],
    'SETTLE_TRANSACTION': ['investor', 'industry'],
    'VERIFY_LAND': ['admin'],
    'VERIFY_CARBON': ['admin'],
    'RECORD_ESTIMATE': ['landowner', 'admin'],
    'GENERATE_CERTIFICATE': ['industry', 'admin'],
    'ANCHOR_LEDGER': ['admin'],
    'DELETE_LAND': ['landowner', 'admin']
  };

  constructor(private db: Firestore, private userId: string) {
    this.ledger = new LedgerService(db, userId);
    this.auth = new AuthService(db);
  }

  /**
   * NETWORK SECURITY: API Rate Limiting
   */
  private checkRateLimit() {
    const now = Date.now();
    if (!requestLog[this.userId]) requestLog[this.userId] = [];
    requestLog[this.userId] = requestLog[this.userId].filter(t => now - t < WINDOW_MS);
    
    if (requestLog[this.userId].length >= RATE_LIMIT) {
      throw new Error(`Network Security Alert: Rate limit exceeded.`);
    }
    requestLog[this.userId].push(now);
  }

  async dispatch(action: ActionType, payload: any) {
    this.checkRateLimit();
    const role = await this.auth.getUserRole(this.userId);
    
    if (!this.permissions[action].includes(role)) {
      throw new Error(`Access Denied: Role '${role}' lacks authority for protocol '${action}'.`);
    }

    switch (action) {
      case 'REGISTER_LAND':
        return await this.ledger.registerLandAsset(payload);
      
      case 'ISSUE_TOKENS':
        return await this.ledger.issueTokens(payload);
      
      case 'SETTLE_TRANSACTION':
        return await this.ledger.settleTransaction(payload);

      case 'VERIFY_LAND':
        return await this.ledger.verifyLandAsset(payload);

      case 'VERIFY_CARBON':
        return await this.ledger.verifyCarbonEstimate(payload);

      case 'RECORD_ESTIMATE':
        return await this.ledger.recordCarbonEstimate(payload.parcelId, payload.estimate);

      case 'DELETE_LAND':
        return await this.ledger.deleteLandAsset(payload.parcelId);

      case 'GENERATE_CERTIFICATE':
        return { status: 'Generated', timestamp: Date.now() };

      case 'ANCHOR_LEDGER':
        return await this.ledger.anchorLedgerState(payload);
      
      default:
        throw new Error(`Gateway Protocol Error: Unknown action ${action}`);
    }
  }
}
