import { Timestamp, GeoPoint } from "firebase/firestore";

export interface Incident {
  id: string;

  userId?: any;
  userEmail: string;

  category: string;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "rejected" | string;

  submittedAt: Timestamp;
  updatedAt: Timestamp;

  location: GeoPoint;
  responderLocation?: GeoPoint;

  responderId?: string;
  responderEmail?: string;

  images: string[]; // image URLs or base64 strings

  aiSuggestion?: {
    damageType: string;
    estimatedCost: string;
  };
}
