// hooks/useCompanyVehicles.ts
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

export interface Vehicle {
  id?: string;
  plate: string;
  type: string;
  [key: string]: any;
}

export const useCompanyVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      try {
        const companyQuery = query(
          collection(db, "towing_companies"),
          where("adminId", "==", user.uid)
        );
        const companySnap = await getDocs(companyQuery);
        const companyDoc = companySnap.docs[0];
        if (!companyDoc) return;

        setCompanyId(companyDoc.id);

        const vehicleIds = companyDoc.data().vehicleIds || [];
        const vehicleDocs = await Promise.all(
          vehicleIds.map(async (id: string) => {
            const vehicleSnap = await getDoc(doc(db, "vehicles", id));
            return { id: vehicleSnap.id, ...vehicleSnap.data() } as Vehicle;
          })
        );

        setVehicles(vehicleDocs);
      } catch (error) {
        console.error("Failed to fetch vehicles", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const addVehicle = async (vehicle: Vehicle) => {
    if (!companyId) return;
    const docRef = await addDoc(collection(db, "vehicles"), vehicle);
    await updateDoc(doc(db, "towing_companies", companyId), {
      vehicleIds: arrayUnion(docRef.id),
    });
    setVehicles((prev) => [...prev, { ...vehicle, id: docRef.id }]);
  };

  const updateVehicle = async (id: string, updatedData: Partial<Vehicle>) => {
    await updateDoc(doc(db, "vehicles", id), updatedData);
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updatedData } : v))
    );
  };

  const deleteVehicle = async (id: string) => {
    if (!companyId) return;
    await deleteDoc(doc(db, "vehicles", id));
    await updateDoc(doc(db, "towing_companies", companyId), {
      vehicleIds: arrayRemove(id),
    });
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  return { vehicles, loading, addVehicle, updateVehicle, deleteVehicle };
};
