import {
  collection,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";

export interface InsuranceHolder {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
  isVerified: boolean;
  status: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  role: string;
}

export function useInsuranceHolders() {
  const [insuranceHolders, setInsuranceHolders] = useState<InsuranceHolder[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const companyQuery = query(
      collection(db, "insurance_company"),
      where("adminId", "==", auth.currentUser.uid)
    );

    const unsubscribeCompany = onSnapshot(companyQuery, (companySnap) => {
      if (!companySnap.empty) {
        const companyDoc = companySnap.docs[0];
        const adminId = companyDoc.data().adminId;

        const usersQuery = query(
          collection(db, "users"),
          where("role", "==", "civilian"),
          where("companyId", "==", adminId)
        );

        const unsubscribeUsers = onSnapshot(usersQuery, (userSnap) => {
          const data = userSnap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<InsuranceHolder, "id">),
          }));

          setInsuranceHolders(data);
          setLoading(false);
        });

        return unsubscribeUsers;
      } else {
        setInsuranceHolders([]);
        setLoading(false);
      }
    });

    return () => unsubscribeCompany();
  }, []);

  return { insuranceHolders, loading };
}
