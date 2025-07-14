// hooks/useUserRole.ts
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "../../firebase";
import { getDoc, doc } from "firebase/firestore";

type UserRole = "super_admin" | "towing_company" | null;

export const useUserRole = (): UserRole => {
  const [role, setRole] = useState<UserRole>(null);

  console.log(role);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const currentDoc = await getDoc(doc(firestore, "users", user.uid));
        setRole(currentDoc.data()?.role as UserRole);
      } else {
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return role;
};
