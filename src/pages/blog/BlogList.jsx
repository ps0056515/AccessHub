import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogpostsApi } from 'api/client';
import { SITE_NAME } from 'brand';
import Container from 'components/common/Container/Container';
import ContentCard from 'components/common/ContentCard/ContentCard';
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
        <h1 className={styles.title}>Blogposts</h1>
        <p className={styles.subtitle}>Latest updates, guides, and stories from the community.</p>
      </header>

      {loading ? (
        <p>Loading blogposts...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : blogposts.length > 0 ? (
        <div className={styles.grid}>
          {blogposts.map(blogpost => (
            <ContentCard
              key={blogpost.id}
              to={`/blog/${blogpost.id}`}
              image={blogpost.cover_image}
              title={blogpost.title}
              author={blogpost.author}
              date={blogpost.published_date}
              typeIcon="📰"
            />
          ))}
        </div>
      ) : (
        <p>No blogposts published yet. Check back soon!</p>
      )}
    </Container>
  );
}
