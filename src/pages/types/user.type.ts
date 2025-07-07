export type User = {
  id: string;
  fullName: string;
  email: string;
  role: "civilian" | "insurer" | "responder" | "tow_operator" | "admin";
  isVerified: boolean;
  // Add other fields from your Firestore users collection
};
