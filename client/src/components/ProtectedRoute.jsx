import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // Si el usuario no existe (no está logueado), lo mandamos al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si está logueado, lo dejamos pasar (renderizamos el componente hijo)
  return children;
};

export default ProtectedRoute;