import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { articlesApi } from "api/client";
import { SITE_NAME } from "brand";
import Container from "components/common/Container/Container";
import ContentCard from "components/common/ContentCard/ContentCard";
import styles from "./Articles.module.css";

export default function ArticlesList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = `Articles · ${SITE_NAME}`;

    const fetchArticles = async () => {
      try {
        const { articles: data } = await articlesApi.list();
        setArticles(data || []);
      } catch (err) {
        setError("Failed to load articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <Container className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Articles & News</h1>
        <p className={styles.subtitle}>
          Latest updates, guides, and stories from the community.
        </p>
      </header>

      {loading ? (
        <p>Loading articles...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : articles.length > 0 ? (
        <div className={styles.grid}>
          {articles.map((article) => (
            <ContentCard
              key={article.id}
              to={`/articles/${article.id}`}
              image={article.cover_image}
              title={article.title}
              author={article.author}
              date={article.published_date}
              typeIcon="📰"
            />
          ))}
        </div>
      ) : (
        <p>No articles published yet. Check back soon!</p>
      )}
    </Container>
  );
}
