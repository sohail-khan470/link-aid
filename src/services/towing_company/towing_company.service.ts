import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";

// Define the TowingCompany interface
interface TowingCompany {
  id?: string;
  adminId: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  createdAt?: Date;
  location?: string;
  isActive: boolean;
  region: string;
}

// Service class for towing_companies collection
class TowingCompaniesService {
  private collectionRef = collection(db, "towing_companies");

  // Create a new towing company
  async create(towingCompany: TowingCompany): Promise<string> {
    try {
      const docRef = await addDoc(this.collectionRef, towingCompany);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Error creating towing company: ${error.message}`);
    }
  }

  // Get all towing companies
  async getAll(): Promise<TowingCompany[]> {
    try {
      const snapshot = await getDocs(this.collectionRef);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as TowingCompany)
      );
    } catch (error: any) {
      throw new Error(`Error fetching towing companies: ${error.message}`);
    }
  }

  // Get a towing company by ID
  async getById(id: string): Promise<TowingCompany | null> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as TowingCompany;
      }
      return null;
    } catch (error: any) {
      throw new Error(`Error fetching towing company: ${error.message}`);
    }
  }

  // Update a towing company
  async update(id: string, data: Partial<TowingCompany>): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, id);
      await updateDoc(docRef, data);
    } catch (error: any) {
      throw new Error(`Error updating towing company: ${error.message}`);
    }
  }

  // Delete a towing company
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Error deleting towing company: ${error.message}`);
    }
  }

  // Find towing companies by field value
  async findByField(field: string, value: any): Promise<TowingCompany[]> {
    try {
      const q = query(this.collectionRef, where(field, "==", value));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as TowingCompany)
      );
    } catch (error: any) {
      throw new Error(`Error finding towing companies: ${error.message}`);
    }
  }
}

export const towingCompaniesService = new TowingCompaniesService();
