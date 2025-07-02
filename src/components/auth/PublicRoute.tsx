// src/components/common/PublicRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import LoadingSpinner from "../ui/LoadingSpinner";

const PublicRoute = () => {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return <LoadingSpinner />;
  }

  return !user ? <Outlet /> : <Navigate to="/" replace />;
};

export default PublicRoute;
