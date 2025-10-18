
import { Navigate } from 'react-router-dom';

import type { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  roles?: string[];
}

const AuthGuard = ({ children, roles }: AuthGuardProps) => {
 
  const isAuthenticated = !!localStorage.getItem('access_token');
  const userRole = localStorage.getItem('role'); // 'admin' or 'user'
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles && (!userRole || !roles.includes(userRole))) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AuthGuard;