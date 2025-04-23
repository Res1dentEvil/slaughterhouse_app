import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  element: JSX.Element;
  allowedRoles: string[];
  userRole: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles, userRole }) => {
  return allowedRoles.includes(userRole) ? element : <Navigate to="/" />;
};
export default ProtectedRoute;
