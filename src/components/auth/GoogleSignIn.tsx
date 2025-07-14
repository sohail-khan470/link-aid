import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../firebase";

export const GoogleSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create a new user doc
        await setDoc(userRef, {
          fullName: user.displayName || "",
          email: user.email || "",
          phone: user.phoneNumber || "",
          role: "civilian", // Default role — change logic as needed
          language: "en",
          isVerified: false,
          location: null,
          createdAt: serverTimestamp(),
        });
      }

      // Optionally: redirect or notify user
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      setError("Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGoogleSignIn} disabled={loading}>
        {loading ? "Signing In..." : "Sign In with Google"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};
