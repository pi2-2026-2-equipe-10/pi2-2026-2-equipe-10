import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUser } from '../services/storage';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: Array<'ADMINISTRADOR' | 'FUNCIONARIO' | string>;
}

/**
 * Componente Guardião de Rotas (Frontend 1 & Frontend 3 - RBAC):
 * - Redireciona para /login quando o usuário não está autenticado.
 * - Redireciona para /forbidden (403) quando a rota exige perfis específicos (allowedRoles)
 *   e o perfil do usuário autenticado não possui permissão.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const user = getUser();
    const userRole = (user?.perfil || 'FUNCIONARIO').toUpperCase();
    const hasPermission = allowedRoles.some((role) => role.toUpperCase() === userRole);

    if (!hasPermission) {
      return <Navigate to="/forbidden" state={{ from: location }} replace />;
    }
  }

  return children;
};
