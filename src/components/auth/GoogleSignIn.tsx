import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import { useNavigate } from "react-router";

export const GoogleSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.uid) {
        throw new Error("No UID returned from Google sign-in");
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          fullName: user.displayName || "",
          email: user.email || "",
          phone: user.phoneNumber || "",
          role: "civilian",
          language: "en",
          isVerified: false,
          location: null,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      } else {
        console.log("User document already exists"); // Debug log
      }

      navigate("/");
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      setError(err.message || "Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`w-full max-w-xs px-4 py-2 rounded-md font-medium flex items-center justify-center transition-colors duration-200
      ${
        loading
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
      }
    `}
      >
        {loading ? (
          "Signing In..."
        ) : (
          <>
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Sign In with Google
          </>
        )}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
};
