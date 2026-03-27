
export type UserRole = 'landowner' | 'investor' | 'industry' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface LandParcel {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  areaAcres: number;
  status: 'pending' | 'verified' | 'rejected';
  carbonPotential?: number;
  tokensIssued?: number;
  documents?: string[];
}

export interface CarbonCredit {
  id: string;
  parcelId: string;
  amount: number;
  verificationDate: string;
  status: 'available' | 'sold' | 'retired';
  signature?: string;
}

export interface TokenInvestment {
  id: string;
  investorId: string;
  parcelId: string;
  tokenAmount: number;
  purchasePrice: number;
  purchaseDate: string;
}
