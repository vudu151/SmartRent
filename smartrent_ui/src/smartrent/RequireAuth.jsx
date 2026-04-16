import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import { getMyPortalToken } from "@/api/user";

export function RequireAuth({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === 'TENANT') {
      let isMounted = true;
      getMyPortalToken().then(data => {
        if (isMounted) {
          navigate(`/portal/${data.portalToken}`, { replace: true });
        }
      }).catch(err => {
        console.error("Lỗi xác thực Portal", err);
        if (isMounted) {
          navigate("/auth/sign-in", { replace: true });
        }
      });
      return () => { isMounted = false };
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Show loading state while checking authentication
  if (isLoading || (user?.role === 'TENANT')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang chuẩn bị Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace state={{ from: location.pathname }} />;
  }

  return children;
}
