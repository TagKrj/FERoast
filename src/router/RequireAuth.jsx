import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

export default function RequireAuth() {
  const context = useOutletContext();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ returnTo: `${location.pathname}${location.search}` }} />;
  }

  // Forward the layout context (t) to the guarded pages.
  return <Outlet context={context} />;
}
