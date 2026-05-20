import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useAuthRedirect(goToPortal) {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const from = location.state?.from || '/';
    if (from !== '/') {
      navigate(from, { replace: true });
      return;
    }
    if (typeof goToPortal === 'function') {
      goToPortal();
      return;
    }
    navigate('/');
  }, [location.state, goToPortal, navigate]);
}
