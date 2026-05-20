import { useEffect, useRef, useState } from 'react';
import styles from './AuthPage.module.css';

const SCRIPT_ID = 'google-gsi-client';

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Could not load Google sign-in.')), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Google sign-in.'));
    document.head.appendChild(script);
  });
}

export default function GoogleSignInButton({
  clientId,
  onSuccess,
  onError,
  text = 'signin_with',
  disabled = false,
}) {
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const [status, setStatus] = useState('loading');

  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!clientId || disabled) return undefined;

    let cancelled = false;

    async function init() {
      setStatus('loading');
      try {
        await loadGoogleScript();
        if (cancelled || !btnRef.current || !wrapRef.current || !window.google?.accounts?.id) {
          return;
        }

        const width = Math.min(
          Math.max(Math.floor(wrapRef.current.getBoundingClientRect().width), 240),
          400
        );

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: response => {
            if (response.credential) {
              onSuccessRef.current?.(response.credential);
            } else {
              onErrorRef.current?.(new Error('Google sign-in was cancelled.'));
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        btnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(btnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          width,
          shape: 'rectangular',
        });

        if (!cancelled) setStatus('ready');
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          onErrorRef.current?.(err);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [clientId, text, disabled]);

  if (!clientId) return null;

  return (
    <div ref={wrapRef} className={styles.googleWrap}>
      {status === 'loading' && (
        <p className={styles.googleLoading} aria-live="polite">
          Loading Google sign-in…
        </p>
      )}
      <div
        ref={btnRef}
        className={styles.googleBtn}
        style={{ display: status === 'ready' ? 'flex' : 'none' }}
      />
    </div>
  );
}
