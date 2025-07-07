export interface InsuranceCompany {
  id: string; // Firestore document ID
  companyName: string;
  contactEmail: string;
  userId: string; // reference to User (role: "insurer")
  activeClaims: string[]; // array of claim IDs
  region: string;
  createdAt: Date;
}
