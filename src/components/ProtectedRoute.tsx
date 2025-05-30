import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const rehydrating = useSelector((state: RootState) => state.auth.rehydrating);
  if (rehydrating) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
