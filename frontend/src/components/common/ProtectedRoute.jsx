import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
const ProtectedRoute = (allowedRoles) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="loader"></div>
      </div>
    );
  }

  const isGuestAllowed = allowedRoles?.includes(undefined);

  if (!user && !isGuestAllowed) {
    return <Navigate to="/login" replace />;
  }
  if (user && allowedRoles && !allowedRoles.includes(user.data)) {
    if (user.role === "admin")
      return <Navigate to="/admin-dashboard" replace />;

    if (user.role === "seller") return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

//public route

const PublicRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="loader"></div>
      </div>
    );
  }

  if (user) {
    if (user.role === "admin")
      return <Navigate to="/admin-dashboard" replace />;

    if (user.role === "seller") return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
export { ProtectedRoute, PublicRoute };
