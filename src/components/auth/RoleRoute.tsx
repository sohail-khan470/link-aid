// components/auth/RoleRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import LoadingSpinner from "../ui/LoadingSpinner";
import Unauthorised from "../../pages/Shared/Unauthourised/Unauthorised";
import { useUserRole } from "../../hooks/use-role";

type RoleRouteProps = {
  allowedRoles: string[];
};

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const role = useUserRole();

  if (role === null) return <LoadingSpinner />;
  if (!allowedRoles.includes(role)) return <Unauthorised />;

  return <Outlet />;
};
