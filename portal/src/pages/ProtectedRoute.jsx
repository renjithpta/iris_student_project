import { Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

export default function ProtectedRoute({ children }) {

  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/official/login" />;

  try {
    const decoded = jwt_decode(token);
    const now = Date.now() / 1000;

    if (decoded.exp < now) {
      localStorage.removeItem("token");
      return <Navigate to="/official/login" />;
    }

    return children;

  } catch {
    return <Navigate to="/official/login" />;
  }
}