import { useAuthStore } from "../../store/auth.store";

export const GoogleSignIn = () => {
  const { signInWithGoogle, loading, error } = useAuthStore();

  return (
    <div>
      <button onClick={signInWithGoogle} disabled={loading}>
        {loading ? "Signing In..." : "Sign In with Google"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};
