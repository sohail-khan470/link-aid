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
    const role = userData?.role;

    await updateDoc(userRef, { lastLogin: serverTimestamp() });

    const roleRoutes: Record<string, string> = {
      super_admin: "/",
      civilian: "/home",
      towing_company: "/home",
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
