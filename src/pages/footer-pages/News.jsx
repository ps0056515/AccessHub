import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { newsApi } from 'api/client';
import { SITE_NAME } from 'brand';

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
    <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>News</h1>
      <p style={{ lineHeight: 1.7, color: 'var(--text-muted)' }}>
        Latest updates from W3C and the {SITE_NAME} community.
      </p>

      <section style={{ marginTop: '2rem' }} aria-labelledby="w3c-news-heading">
        <h2 id="w3c-news-heading" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          W3C News
        </h2>

        {loading && <p>Loading news…</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && !error && items.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
            {items.map((item) => (
              <li
                key={item.link}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--bg-card, #fff)',
                }}
              >
                <a
                  href={item.link}
                  style={{ fontWeight: 500, color: 'var(--accent, #074a9e)', textDecoration: 'none' }}
                >
                  {item.title}
                </a>
                {item.pubDate && (
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {formatDate(item.pubDate)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {feedUrl && (
          <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Subscribe in your feed reader:{' '}
            <code style={{ wordBreak: 'break-all' }}>{feedUrl}</code>
          </p>
        )}
      </section>

      <section style={{ marginTop: '2.5rem' }} aria-labelledby="community-news-heading">
        <h2 id="community-news-heading" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          Community
        </h2>
        <ul style={{ lineHeight: 1.8 }}>
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
