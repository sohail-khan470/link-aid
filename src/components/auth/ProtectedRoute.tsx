// src/components/common/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { auth } from "../../../firebase";

const ProtectedRoute = () => {
  const currentUser = auth.currentUser;
  return currentUser ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
