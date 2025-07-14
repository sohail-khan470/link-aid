// src/components/common/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { auth, db } from "../../../firebase";
import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ProtectedRoute = () => {
  const [role, setRole] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          const currentDoc = await getDoc(doc(db, "users", user.uid));
          setRole(currentDoc.data()?.role);
        } else {
          setRole(null);
        }
      },
      [role]
    );

    return () => unsubscribe();
  });

  useEffect(() => {
    <Navigate to="/" replace />;
  }, [role]);
  const currentUser = auth.currentUser;
  return currentUser ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
