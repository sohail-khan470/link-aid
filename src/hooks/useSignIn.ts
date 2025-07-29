import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from "firebase/auth";
import { toast } from "react-toastify";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { logAction } from "../utils/logAction";

export function useSignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handlePostSignIn = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User profile not found in Firestore.");
    }

    const userData = userSnap.data();
    const role = userData?.role ?? "unknown";
    // const userName = userData?.fullName ?? "Unknown";

    await updateDoc(userRef, { lastLogin: serverTimestamp() });

    // // ✅ Exclude super_admin from logging
    // if (role !== "super_admin") {
    //   await logAction({
    //     userId: uid,
    //     userName,
    //     role,
    //     action: "Sign In",
    //     description: `${userName} signed into the system.`,
    //   });
    // }

    const roleRoutes: Record<string, string> = {
      super_admin: "/home",
      towing_company: "/home",
      insurer: "/home",
    };

    if (roleRoutes[role]) {
      navigate(roleRoutes[role], { replace: true });
      toast.success("Signed in successfully!");
    } else {
      navigate("/unauthorized", { replace: true });
      toast.error("Unauthorized role. Access denied.");
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result?.user;

      if (!user?.uid) {
        throw new Error("Google Sign-In failed. No user information received.");
      }

      // ✅ Fetch user data from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User profile not found for Google sign-in.");
      }

      const userData = userSnap.data();
      const role = userData?.role ?? "unknown";
      const userName = userData?.fullName ?? "Unknown";

      // ✅ Exclude super_admin from log
      if (role !== "super_admin") {
        await logAction({
          userId: user.uid,
          userName,
          role,
          action: "Sign In",
          description: `${userName} signed in with Google.`,
        });
      }

      await updateDoc(userRef, { lastLogin: serverTimestamp() });

      await handlePostSignIn(user.uid);
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      toast.error(err?.message || "Google Sign-In failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await handlePostSignIn(result.user.uid);
    } catch (err: any) {
      console.error("Email Sign-In error:", err);
      toast.error("Failed to sign in. Please check your credentials.");
      setError(err.message);
    }
  };

  return {
    showPassword,
    setShowPassword,
    isChecked,
    setIsChecked,
    email,
    setEmail,
    password,
    setPassword,
    googleLoading,
    error,
    handleGoogleSignIn,
    handleSignIn,
  };
}
