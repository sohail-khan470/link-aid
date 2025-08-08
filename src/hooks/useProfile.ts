// hooks/useProfile.ts
import { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

export type UserProfile = {
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  location?: string;
  lastLogin?: Timestamp;
  language?: string;
  isVerified?: boolean;
  [key: string]: any;
};

export const useProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //  Fetch profile once (fallback if needed)
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

  //  Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, error: "User not authenticated" };

    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, updates);
      return { success: true };
    } catch (err) {
      console.error("Error updating profile:", err);
      return { success: false, error: "Failed to update profile" };
    }
  };

  //  Listen in real time
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);

        const userRef = doc(db, "users", currentUser.uid);
        const unsubscribeProfile = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data());
              setError("");
            } else {
              setError("Profile not found");
              setProfile(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error("Error listening to profile:", err);
            setError("Failed to listen to profile");
            setLoading(false);
          }
        );

        return unsubscribeProfile; // unsubscribe on unmount/auth change
      } else {
        setUser(null);
        setProfile(null);
        setError("User not authenticated");
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    refresh: () => user && fetchProfile(user.uid),
    updateProfile,
  };
};
