import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <p className="text-center">Chargement...</p>; // Éviter la redirection avant que tout soit prêt
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
