import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useUserRole } from "../../hooks/use-role";

type RoleRouteProps = {
  allowedRoles: string[];
};

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const role = useUserRole();
  const location = useLocation();

  // Show a loading spinner while role is being fetched
  if (role === null) {
    return <LoadingSpinner />;
  }

  // If role is not allowed, redirect based on role
  if (!allowedRoles.includes(role)) {
    if (role === "super_admin") {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
    if (role === "towing_company") {
      return <Navigate to="/company/home" state={{ from: location }} replace />;
    }
    if (role === "insurer") {
      return <Navigate to="/company/home" state={{ from: location }} replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
