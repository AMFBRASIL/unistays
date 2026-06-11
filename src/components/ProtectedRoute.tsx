import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string[];
  requiredPermission?: string;
}

export function ProtectedRoute({ children, requiredRole, requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Permission-based access control (New System)
  if (requiredPermission && user) {
    const hasPermission = user.permissions?.[requiredPermission]?.read;
    if (!hasPermission) {
      console.warn(`Acesso negado: usuário precisa da permissão '${requiredPermission}'`);
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Role/Group-based access control (Legacy/Fallback)
  if (requiredRole && user && !requiredPermission) {
    // Check if user's group matches any of the required roles (mapped)
    const userGroupName = user.group?.name?.toLowerCase() || '';

    // Simple mapping logic mirroring backend
    const hasPermission = requiredRole.some(role => {
      const r = role.toLowerCase();
      if (r === 'super_admin' && userGroupName.includes('super')) return true;
      if (r === 'admin' && userGroupName.includes('admin')) return true;
      if (r === 'manager' && userGroupName.includes('gerente')) return true;
      if (r === 'receptionist' && userGroupName.includes('recep')) return true;
      if (r === 'viewer' && userGroupName.includes('visu')) return true;
      return userGroupName === r;
    });

    if (!hasPermission) {
      console.warn(`Acesso negado: usuário precisa de permissão ${requiredRole.join(', ')}, mas tem grupo '${user.group?.name}'`);
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
