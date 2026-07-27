import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { articlesApi } from "api/client";
import { SITE_NAME } from "brand";
import Container from "components/common/Container/Container";
import ContentCard from "components/common/ContentCard/ContentCard";
import { useAriaLive } from "context/AriaLiveContext";
import styles from "./Articles.module.css";

export default function ArticlesList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { announce } = useAriaLive();

  useEffect(() => {
    document.title = `Articles  ${SITE_NAME}`;

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

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const query = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.author.toLowerCase().includes(query) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(query))
    );
  }, [articles, searchQuery]);

  useEffect(() => {
    if (!loading && !error) {
      announce(`Found ${filteredArticles.length} articles matching your search.`);
    }
  }, [filteredArticles.length, loading, error, announce]);

  return (
    <Container className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Articles & News</h1>
        <p className={styles.subtitle}>
          Latest updates, guides, and stories from the community.
        </p>
      </header>

      <div className={styles.searchBar}>
        <label htmlFor="article-search" className="sr-only">Search articles</label>
        <input 
          id="article-search"
          type="search" 
          placeholder="Search by title or author..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <p role="status">Loading articles...</p>
      ) : error ? (
        <p style={{ color: "var(--error)" }}>{error}</p>
      ) : filteredArticles.length > 0 ? (
        <div className={styles.grid}>
          {filteredArticles.map((article) => (
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
        <p>No articles match your search. Please try different keywords.</p>
      )}
    </Container>
  );
}

