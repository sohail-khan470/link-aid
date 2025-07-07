// src/services/user.service.ts
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Incident } from "../store/types/incident.type";

class IncidentService {
  private db = getFirestore();

  async getAllIncidents(): Promise<Incident[]> {
    try {
      const incidentsCollection = collection(this.db, "incidentReports");
      const querySnapshot = await getDocs(incidentsCollection);

      // Map through documents and convert to Incident objects
      const incidents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Incident[];

      return incidents;
    } catch (error) {
      console.error("Error fetching incidents:", error);
      throw new Error("Failed to fetch incidents");
    }
  }
}

export default IncidentService;
