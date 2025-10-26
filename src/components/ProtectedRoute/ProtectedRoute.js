import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Loading from '../Loading/Loading';

function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useApp();

  if (authLoading) {
    return <Loading fullScreen text="Verificando autenticación..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
