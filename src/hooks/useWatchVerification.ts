import { useEffect } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, Timestamp } from "firebase/firestore";

export const useWatchVerification = () => {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        await updateDoc(doc(db, "users", user.uid), {
          isVerified: true,
          verifiedAt: Timestamp.now(),
        });
      }
    });
    return () => unsub();
  }, []);
};
