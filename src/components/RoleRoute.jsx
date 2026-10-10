import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

/**
 * RoleRoute component
 * - blockedRoles: array of roles that should be denied access (e.g., ['chofer'])
 * - children: React component(s) to render when allowed
 */
export default function RoleRoute({ children, blockedRoles = [] }) {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--signal)]" aria-hidden="true" />
      </div>
    );
  }

  // If the user has a role and it is blocked, redirect to home.
  if (role && blockedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // Otherwise allow access (unauthenticated users are allowed too)
  return children;
}
