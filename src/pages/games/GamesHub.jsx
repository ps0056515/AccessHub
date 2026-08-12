import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gamesApi } from 'api/client';
import { useToast } from 'context/ToastContext';
import styles from './GamesHub.module.css';

export default function GamesHub() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    document.title = 'Accessibility Games | AllCanAccess';
    const fetchGames = async () => {
      try {
        const data = await gamesApi.list();
        setGames(data || []);
      } catch (err) {
        addToast?.('Failed to load games.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [addToast]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Accessibility Games Arcade</h1>
        <p className={styles.subtitle}>
          Play interactive games to learn and test your knowledge of WCAG guidelines and accessibility best practices.
        </p>
      </header>

      {loading ? (
        <div className={styles.loading}>Loading games...</div>
      ) : games.length === 0 ? (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>No Games Available</h2>
          <p className={styles.emptyDesc}>Check back later for new accessibility challenges!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {games.map(game => (
            <div key={game.id} className={styles.card}>
              <div className={styles.thumbnailContainer}>
                {game.thumbnail ? (
                  <img src={game.thumbnail} alt="" className={styles.thumbnail} />
                ) : (
                  <span className={styles.noThumbnail} aria-hidden="true">🎮</span>
                )}
              </div>
              <div className={styles.content}>
                <h2 className={styles.cardTitle}>{game.title}</h2>
                <p className={styles.cardDescription}>
                  {game.description || 'No description available.'}
                </p>
                <Link 
                  to={`/games/${game.slug}`} 
                  className={styles.playBtn}
                  aria-label={`Play ${game.title}`}
                >
                  Play Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
