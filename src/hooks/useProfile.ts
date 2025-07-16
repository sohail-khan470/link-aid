// hooks/useProfile.ts
import { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";

export type UserProfile = {
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  location?: string;
  lastLogin?: Timestamp;
  // createdAt?: { seconds: number; nanoseconds: number };
  [key: string]: any;
};

export const useProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = async (userId: string) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data());
        setError("");
      } else {
        setError("Profile not found");
        setProfile(null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        fetchProfile(currentUser.uid);
      } else {
        setUser(null);
        setProfile(null);
        setError("User not authenticated");
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    refresh: () => user && fetchProfile(user.uid),
  };
};
