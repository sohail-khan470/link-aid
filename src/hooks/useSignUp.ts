import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";

export function useSignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    phone: "",
    language: "en",
    theme: "light",
    role: "civilian",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validateUsername = (username: string) => {
    if (!username) return "Username is required";
    if (username.length < 3 || username.length > 20) {
      return "Username must be between 3 and 20 characters";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 4) {
      return "Password must be at least 4 characters long";
    }
    return "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate on change
    if (name === "username") {
      setErrors((prev) => ({ ...prev, username: validateUsername(value) }));
    } else if (name === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (name === "password") {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setLoading(true);

    // Validate fields
    const usernameError = validateUsername(formData.username);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    setErrors({
      username: usernameError,
      email: emailError,
      password: passwordError,
    });

    if (usernameError || emailError || passwordError) {
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: formData.username,
        email: formData.email,
        phone: formData.phone || "",
        language: formData.language,
        theme: formData.theme,
        role: formData.role,
        createdAt: serverTimestamp(),
      });

      navigate("/");
    } catch (err: any) {
      console.error("Sign-up failed:", err.message);
      setAuthError(err.message || "Failed to sign up.");
    } finally {
      setLoading(false);
    }
  };

  return {
    showPassword,
    setShowPassword,
    formData,
    errors,
    authError,
    loading,
    handleChange,
    handleSignUp,
  };
}
