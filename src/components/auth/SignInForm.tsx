import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from "firebase/auth";
import { toast } from "react-toastify";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";

export default function SignInForm() {
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

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <div className="grid grid-cols-1">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className={`inline-flex items-center justify-center gap-3 py-3 text-sm font-normal transition-colors rounded-lg px-7 
                ${
                  googleLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                }`}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              {googleLoading ? "Signing in..." : "Sign in with Google"}
            </button>
          </div>

          <div className="relative py-3 sm:py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                Or
              </span>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@gmail.com"
              />
            </div>

            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                  Keep me logged in
                </span>
              </div>
              <Link
                to="/reset-password"
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>

            <div>
              <Button className="w-full" size="sm" disabled={googleLoading}>
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign Up
              </Link>
              {error && (
                <p className="mt-2 text-sm text-red-500 text-center sm:text-left">
                  {error}
                </p>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
