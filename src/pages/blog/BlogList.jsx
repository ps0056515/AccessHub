import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogpostsApi } from 'api/client';
import { SITE_NAME } from 'brand';
import Container from 'components/common/Container/Container';
import styles from './Blog.module.css';

export default function BlogpostsList() {
  const [blogposts, setBlogposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = `Blogposts · ${SITE_NAME}`;
    
    const fetchBlogposts = async () => {
      try {
        const { blogposts: data } = await blogpostsApi.list();
        setBlogposts(data || []);
      } catch (err) {
        setError('Failed to load blogposts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogposts();
  }, []);

  return (
    <Container className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Blogposts & News</h1>
        <p className={styles.subtitle}>Latest updates, guides, and stories from the community.</p>
      </header>

      {loading ? (
        <p>Loading blogposts...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : blogposts.length > 0 ? (
        <div className={styles.grid}>
          {blogposts.map(blogpost => (
            <Link to={`/blog/${blogpost.id}`} key={blogpost.id} className={styles.card}>
              {blogpost.cover_image ? (
                <img src={blogpost.cover_image} alt={blogpost.title} className={styles.cardImage} />
              ) : (
                <div className={styles.imagePlaceholder}>📰</div>
              )}
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{blogpost.title}</h2>
                <div className={styles.cardMeta}>
                  <span>{blogpost.author}</span>
                  <span>{new Date(blogpost.published_date).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No blogposts published yet. Check back soon!</p>
      )}
    </Container>
  );
}
