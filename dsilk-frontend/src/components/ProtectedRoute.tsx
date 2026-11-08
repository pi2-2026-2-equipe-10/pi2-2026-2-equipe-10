import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/storage';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

/**
 * Componente Guardião de Rotas (Frontend 1):
 * Redireciona para o login quando o usuário não está autenticado.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
