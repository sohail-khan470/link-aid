import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { InsuranceCompany } from "../pages/types/InsuranceCompany.types";

class InsuranceCompanyService {
  private db = getFirestore();

  async getAllCompanies(): Promise<InsuranceCompany[]> {
    try {
      const querySnapshot = await getDocs(
        collection(this.db, "insurance_company")
      );

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...this.convertTimestamps(doc.data()),
      })) as InsuranceCompany[];
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw new Error("Failed to fetch companies");
    }
  }

  async getCompanyById(companyId: string): Promise<InsuranceCompany | null> {
    try {
      const docRef = doc(this.db, "insurance_company", companyId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...this.convertTimestamps(docSnap.data()),
        } as InsuranceCompany;
      }
      return null;
    } catch (error) {
      console.error("Error fetching company:", error);
      throw new Error("Failed to fetch company");
    }
  }

  async addCompany(company: Omit<InsuranceCompany, "id">): Promise<string> {
    try {
      const docRef = await addDoc(
        collection(this.db, "insurance_company"),
        this.prepareCompanyData(company)
      );
      return docRef.id;
    } catch (error) {
      console.error("Error adding company:", error);
      throw new Error("Failed to add company");
    }
  }

  async updateCompany(
    companyId: string,
    data: Partial<InsuranceCompany>
  ): Promise<void> {
    try {
      const companyRef = doc(this.db, "insurance_company", companyId);
      await updateDoc(companyRef, this.prepareCompanyData(data));
    } catch (error) {
      console.error("Error updating company:", error);
      throw new Error("Failed to update company");
    }
  }

  async deleteCompany(companyId: string): Promise<void> {
    try {
      const companyRef = doc(this.db, "insurance_company", companyId);
      await deleteDoc(companyRef);
    } catch (error) {
      console.error("Error deleting company:", error);
      throw new Error("Failed to delete company");
    }
  }

  private prepareCompanyData(company: Partial<InsuranceCompany>): any {
    // Remove undefined values and the id field
    return Object.fromEntries(
      Object.entries(company).filter(
        ([key, value]) => value !== undefined && key !== "id"
      )
    );
  }

  private isFirestoreTimestamp(value: any): value is Timestamp {
    return (
      value &&
      typeof value === "object" &&
      "toDate" in value &&
      typeof value.toDate === "function"
    );
  }

  private convertTimestamps(data: any): any {
    if (!data || typeof data !== "object") return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.convertTimestamps(item));
    }

    if (this.isFirestoreTimestamp(data)) {
      return data.toDate();
    }

    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        this.convertTimestamps(value), // Recursive handling
      ])
    );
  }
}

export default InsuranceCompanyService;
