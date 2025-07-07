import { GeoPoint, Timestamp } from "firebase/firestore";

export interface TowRequest {
  id: string; // Firestore document ID
  userId: string;
  vehicleType: string;
  location: GeoPoint;
  status: Status;
  matchedOperatorId: string;
  etaMinutes: number;
  priorityScore: number;
  notes: string;
  createdAt: Timestamp;
}

enum Status {
  REQUESTED = "requested",
  MATCHED = "matched",
  EN_ROUTE = "en_route",
  COMPLETED = "completed",
}
