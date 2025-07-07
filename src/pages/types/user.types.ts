export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isVerified: boolean;
  // Add other fields from your Firestore users collection
};

enum Role {
  CIVILIAN = "civilian",
  INSURER = "insurer",
  RESPONDER = "responder",
  TOW_OPERATOR = "tow_operator",
  ADMIN = "admin",
}
