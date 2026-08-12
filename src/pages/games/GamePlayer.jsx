import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gamesApi } from 'api/client';
import { useAriaLive } from 'context/AriaLiveContext';
import styles from './GamePlayer.module.css';
import { SITE_NAME } from 'brand';

export default function GamePlayer() {
  const { slug } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const { announce } = useAriaLive();
  const backBtnRef = useRef(null);
  const iframeRef = useRef(null);

  const handleIframeLoad = () => {
    if (!iframeRef.current) return;
    try {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (iframeDoc) {
        // Remove existing just in case
        iframeDoc.removeEventListener('keydown', handleIframeKeydown);
        iframeDoc.addEventListener('keydown', handleIframeKeydown);
        
        // Enter theater mode when the user clicks or tabs into the game
        const enterTheaterMode = () => {
          setIsTheaterMode(true);
        };
        iframeDoc.addEventListener('focusin', enterTheaterMode);
        iframeDoc.addEventListener('click', enterTheaterMode);
      }
    } catch (err) {
      console.warn("Could not attach Escape listener to game iframe. It may not be same-origin.", err);
    }
  };

  const handleIframeKeydown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsTheaterMode(false);
      if (backBtnRef.current) {
        backBtnRef.current.focus();
      }
    }
  };

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const data = await gamesApi.get(slug);
        setGame(data);
        document.title = `${data.title} | ${SITE_NAME}`;
        announce(`Loaded game ${data.title}`);
      } catch (err) {
        setError(err.message || 'Failed to load the game.');
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className={styles.page}>
        <Link to="/games" className={styles.backBtn}>
          <span aria-hidden="true">←</span> Back to Games
        </Link>
        <div className={styles.errorState}>
          <h1 className={styles.errorTitle}>Game Not Found</h1>
          <p>{error || "The game you're looking for doesn't exist or has been disabled."}</p>
        </div>
      </div>
    );
  }

  // Calculate the file path. The API returns the path starting with /api/uploads/
  // The server handles this static serving.
  const iframeSrc = game.html_file_path.startsWith('http') 
    ? game.html_file_path 
    : `${window.location.origin}${game.html_file_path}`;

  return (
    <div className={styles.page}>
      <Link to="/games" className={styles.backBtn} ref={backBtnRef}>
        <span aria-hidden="true">←</span> Back to Games
      </Link>
      
      <header className={styles.header}>
        <h1 className={styles.title}>{game.title}</h1>
        {game.description && <p className={styles.description}>{game.description}</p>}
      </header>

      <div className={`${styles.playerContainer} ${isTheaterMode ? styles.theaterMode : ''}`}>
        <a href="#footer" className={styles.skipGameLink}>
          Skip Game (Jump to Footer)
        </a>
        
        {/* Top Focus Guard */}
        <div 
          tabIndex="0" 
          aria-hidden="true" 
          style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0 }}
          onFocus={() => iframeRef.current?.focus()}
        ></div>

        <iframe
          ref={iframeRef}
          title={game.title}
          src={iframeSrc}
          className={styles.iframe}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
          allowFullScreen
          allow="autoplay; fullscreen"
          onLoad={handleIframeLoad}
        />

        {/* Bottom Focus Guard */}
        <div 
          tabIndex="0" 
          aria-hidden="true" 
          style={{ position: 'fixed', bottom: 0, left: 0, width: 0, height: 0 }}
          onFocus={() => iframeRef.current?.focus()}
        ></div>
      </div>
    </div>
  );
}
