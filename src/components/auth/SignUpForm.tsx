import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import { useAuthStore } from "../../store/auth.store";
import { useNavigate } from "react-router";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    phone: "",
    language: "en",
    theme: "light",
    role: "Admin",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    username: "",
  });

  const { signUp, error: authError, loading } = useAuthStore();
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

    // Validate all fields before submission
    const usernameError = validateUsername(formData.username);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setErrors({
      username: usernameError,
      email: emailError,
      password: passwordError,
    });

    // Prevent submission if there are validation errors
    if (usernameError || emailError || passwordError) {
      return;
    }

    const userData = {
      ...formData,
      createdAt: new Date(),
    };
    await signUp(userData);
    if (!authError) navigate("/");
  };

  // Language options for the dropdown
  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
  ];

  // Theme options for the dropdown
  const themes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your details to sign up!
            </p>
          </div>
          <div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm"></div>
            </div>
            <form onSubmit={handleSignUp}>
              <div className="space-y-5">
                {/* Username Field */}
                <div>
                  <Label>
                    Username<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  {errors.username && (
                    <div className="text-sm text-error-500 mt-1">
                      {errors.username}
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <div className="text-sm text-error-500 mt-1">
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
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
                  {errors.password && (
                    <div className="text-sm text-error-500 mt-1">
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Language Field - Custom Select */}
                <div>
                  <Label>Language</Label>
                  <Select
                    id="language"
                    name="language"
                    options={languages}
                    placeholder="Select a language"
                    onChange={(value) =>
                      handleChange({
                        target: { name: "language", value },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                    defaultValue={formData.language}
                  />
                </div>

                {/* Theme Field - Custom Select */}
                <div>
                  <Label>Theme Preference</Label>
                  <Select
                    id="theme"
                    name="theme"
                    options={themes}
                    placeholder="Select a theme"
                    onChange={(value) =>
                      handleChange({
                        target: { name: "theme", value },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                    defaultValue={formData.theme}
                  />
                </div>

                {/* Error Display for Auth Errors */}
                {authError && (
                  <div className="text-sm text-error-500">{authError}</div>
                )}

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Signing Up..." : "Sign Up"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
