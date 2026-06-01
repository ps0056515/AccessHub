import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { screenReadersApi } from 'api/client';
import Container from 'components/common/Container/Container';
import styles from './ScreenReaders.module.css';

export default function ScreenReadersList() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Screen Readers · AllCanAccess';
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const res = await screenReadersApi.list();
      setGuides(res.data);
    } catch (err) {
      setError('Failed to load screen reader guides.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Container className={styles.container}>Loading guides...</Container>;
  if (error) return <Container className={styles.container}>{error}</Container>;

  return (
    <Container className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Screen Readers</h1>
        <p className={styles.subtitle}>
          Comprehensive guides and testing checklists for standard assistive technologies.
        </p>
      </header>

      <div className={styles.grid}>
        {guides.map(guide => (
          <Link key={guide.id} to={`/screen-readers/${guide.id}`} className={styles.card}>
            <h2 className={styles.cardTitle}>{guide.title}</h2>
            <p className={styles.cardBody}>{guide.description}</p>
            <span className={styles.cardFooter}>View guide</span>
          </Link>
        ))}
      </div>
      
      {guides.length === 0 && (
        <p>No guides available at this time.</p>
      )}
    </Container>
  );
}
