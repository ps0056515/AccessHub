import { useEffect, useState } from 'react';

const ENV_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || null;

export function useGoogleClientId() {
  const [clientId, setClientId] = useState(ENV_CLIENT_ID);
  const [loading, setLoading] = useState(!ENV_CLIENT_ID);
  const [apiUnreachable, setApiUnreachable] = useState(false);

  useEffect(() => {
    if (ENV_CLIENT_ID) return undefined;

    let cancelled = false;

    fetch('/api/auth/config')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Config request failed (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setClientId(data?.googleClientId || null);
          setApiUnreachable(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setClientId(null);
          setApiUnreachable(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { clientId, loading, apiUnreachable };
}
