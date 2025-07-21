// src/services/user.service.ts
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { TowRequest } from "../../pages/types/TowReuest";

class TowRequestService {
  private db = getFirestore();

  async getAllTowRequests(): Promise<TowRequest[]> {
    try {
      const towRequestsCollection = collection(this.db, "tow_requests");
      const querySnapshot = await getDocs(towRequestsCollection);

      // Map through documents and convert to Incident objects
      const towRequests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TowRequest[];

      return towRequests;
    } catch (error) {
      console.error("Error fetching all tow requests:", error);
      throw new Error("Failed to fetch all tow requests");
    }
  }
}

export default TowRequestService;
