import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { auth } from "../../firebase";

interface TowRequest {
  id: string;
  createdAt?: Date;
  location: {
    lat: number;
    lng: number;
  };
  priorityScore?: number;
  status: "requested" | "accepted" | "completed" | "cancelled";
  userId: string;
  vehicleType: string;
}

export const useTowRequest = () => {
  const [towRequests, setTowRequests] = useState<TowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const db = getFirestore();

  useEffect(() => {
    const fetchTowRequests = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "tow_requests"));
        const requests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(), // Convert Firestore timestamp to Date
        })) as TowRequest[];
        setTowRequests(requests);
        setError(null);
      } catch (err) {
        setError("Failed to fetch tow requests");
        console.error("Error fetching tow requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTowRequests();
  }, [db]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const createTowRequest = async (
    requestData: Omit<TowRequest, "id" | "createdAt" | "status">
  ) => {
    setFormLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const newRequest = {
        ...requestData,
        userId: user.uid,
        status: "requested" as const,
        createdAt: serverTimestamp(),
        priorityScore: 0.1, // Default score
      };

      const docRef = await addDoc(collection(db, "tow_requests"), newRequest);

      setTowRequests((prev) => [
        ...prev,
        {
          id: docRef.id,
          ...newRequest,
          createdAt: undefined, // Will be updated on next fetch
        },
      ]);

      toast.success("Tow request created successfully");
      return docRef.id;
    } catch (error) {
      setError("Failed to create tow request");
      toast.error("Failed to create tow request");
      return null;
    } finally {
      setFormLoading(false);
    }
  };

  const updateTowRequest = async (
    id: string,
    updateData: Partial<TowRequest>
  ) => {
    setFormLoading(true);
    try {
      await updateDoc(doc(db, "tow_requests", id), updateData);
      setTowRequests((prev) =>
        prev.map((request) =>
          request.id === id ? { ...request, ...updateData } : request
        )
      );
      toast.success("Tow request updated successfully");
      return true;
    } catch (error) {
      setError("Failed to update tow request");
      toast.error("Failed to update tow request");
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const deleteTowRequest = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this tow request?")) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, "tow_requests", id));
        setTowRequests((prev) => prev.filter((request) => request.id !== id));
        toast.success("Tow request deleted successfully");
      } catch (error) {
        setError("Failed to delete tow request");
        toast.error("Failed to delete tow request");
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    towRequests,
    loading,
    error,
    formLoading,
    createTowRequest,
    updateTowRequest,
    deleteTowRequest,
  };
};
