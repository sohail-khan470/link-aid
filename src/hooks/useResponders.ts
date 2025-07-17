import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const db = getFirestore();

export interface Responder {
  id: string;
  fullName: string;
  isVerified: boolean;
  language: string;
  location?: string;
  phone?: string;
  role: string;
  createdAt?: any;
  verifiedAt?: any;
}

export const useResponders = () => {
  const [responders, setResponders] = useState<Responder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchResponders = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", "responder"));
      const snapshot = await getDocs(q);

      const data: Responder[] = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Omit<Responder, "id">),
        id: docSnap.id,
      }));

      setResponders(data);
    } catch (error) {
      console.error("Failed to fetch responders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateIsVerified = async (id: string, value: boolean) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { isVerified: value });
      setResponders((prev) =>
        prev.map((responder) =>
          responder.id === id ? { ...responder, isVerified: value } : responder
        )
      );
    } catch (error) {
      console.error("Failed to update isVerified:", error);
    }
  };

  const updateLanguage = async (id: string, lang: string) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { language: lang });
      setResponders((prev) =>
        prev.map((responder) =>
          responder.id === id ? { ...responder, language: lang } : responder
        )
      );
    } catch (error) {
      console.error("Failed to update language:", error);
    }
  };

  useEffect(() => {
    fetchResponders();
  }, []);

  return { responders, loading, updateIsVerified, updateLanguage };
};
