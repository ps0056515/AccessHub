import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

function measureButtonWidth(el) {
  if (!el) return 320;
  const width = Math.floor(el.getBoundingClientRect().width);
  return Math.min(Math.max(width, 200), 400);
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
  const [ready, setReady] = useState(false);
  const [buttonWidth, setButtonWidth] = useState(0);

  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;

    const updateWidth = () => setButtonWidth(measureButtonWidth(el));
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [clientId]);

  useLayoutEffect(() => {
    setReady(false);
  }, [clientId, text, buttonWidth]);

  useEffect(() => {
    if (!clientId || disabled || buttonWidth < 200) return undefined;

    let cancelled = false;

    async function init() {
      try {
        await loadGoogleScript();
        if (cancelled || !btnRef.current || !window.google?.accounts?.id) return;

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
          width: buttonWidth,
          shape: 'rectangular',
        });

        if (!cancelled) setReady(true);
      } catch (err) {
        onErrorRef.current?.(err);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [clientId, text, disabled, buttonWidth]);

  if (!clientId) return null;

  return (
    <div ref={wrapRef} className={styles.googleWrap} aria-hidden={disabled}>
      {!ready && (
        <div className={styles.googlePlaceholder} aria-hidden="true">
          Loading Google sign-in…
        </div>
      )}
      <div ref={btnRef} className={`${styles.googleBtn} ${ready ? styles.googleBtnReady : ''}`} />
    </div>
  );
}
