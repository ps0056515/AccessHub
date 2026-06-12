import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { newsApi } from 'api/client';
import { SITE_NAME } from 'brand';
import styles from './News.module.css';

function formatDate(raw) {
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function News() {
  const [items, setItems] = useState([]);
  const [feedUrl, setFeedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      setLoading(true);
      setError('');
      try {
        const data = await newsApi.feed();
        if (!cancelled) {
          setItems(data.items || []);
          setFeedUrl(data.feedUrl || '');
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load news.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFeed();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.container}>
      <h1>News</h1>
      <p className={styles.subtitle}>
        Latest updates from W3C and the {SITE_NAME} community.
      </p>

      <section className={styles.section} aria-labelledby="w3c-news-heading">
        <h2 id="w3c-news-heading" className={styles.heading}>
          W3C News
        </h2>

        {loading && <p>Loading news…</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && !error && items.length > 0 && (
          <ul className={styles.feedList}>
            {items.map((item) => (
              <li
                key={item.link}
                className={styles.feedItem}
              >
                <a
                  href={item.link}
                  className={styles.feedLink}
                >
                  {item.title}
                </a>
                {item.pubDate && (
                  <p className={styles.feedDate}>
                    {formatDate(item.pubDate)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {feedUrl && (
          <p className={styles.subscribeText}>
            Subscribe in your feed reader:{' '}
            <code className={styles.codeUrl}>{feedUrl}</code>
          </p>
        )}
      </section>

      <section className={styles.communitySection} aria-labelledby="community-news-heading">
        <h2 id="community-news-heading" className={styles.heading}>
          Community
        </h2>
        <ul className={styles.communityList}>
          <li>
            <strong>Discussions</strong> —{' '}
            <Link to="/">Join conversations on the community page</Link>.
          </li>
          <li>
            <strong>Events</strong> —{' '}
            <Link to="/events">See upcoming workshops and office hours</Link>.
          </li>
        </ul>
      </section>
    </div>
  );
}
