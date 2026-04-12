import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { RequireAuth } from "@/smartrent/RequireAuth";

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard/*"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/portal/:token" element={
        <React.Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-gray-50">Đang tải Portal...</div>}>
          {React.createElement(React.lazy(() => import('@/pages/portal/index')))}
        </React.Suspense>
      } />
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
    </Routes>
  );
}

export default App;
