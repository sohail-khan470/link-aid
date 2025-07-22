import { Timestamp } from "firebase/firestore";

// types.ts
export interface Company {
  id: string;
  name: string;
  adminId: string;
  operatorIds: string[];
  vehicleIds: string[];
  email: string;
  phone: string;
  location: [string, string];
  region: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Operator {
  id?: string;
  companyId: string;
  email: string;
  fullName: string;
  status: boolean;
  isVerified: boolean;
  role: string;
  userId: string;
  etaToCurrentJob?: number | null;
  location?: [string, string];
  vehicleTypes?: string[];
}
