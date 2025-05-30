import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { RootState } from '../store';

/**
 * Redirects to /login if user is not authenticated and not already on a public route.
 * Use inside App component to ensure redirect after logout or session timeout.
 */
export function useAuthRedirect() {
  const auth = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.user && !['/login', '/signup'].includes(location.pathname)) {
      navigate('/login', { replace: true });
    }
  }, [auth.user, location.pathname, navigate]);
}
