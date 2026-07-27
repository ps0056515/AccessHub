import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { blogpostsApi } from "api/client";
import { SITE_NAME } from "brand";
import Container from "components/common/Container/Container";
import ContentCard from "components/common/ContentCard/ContentCard";
import { useAriaLive } from "context/AriaLiveContext";
import styles from "./Blog.module.css";

export default function BlogList() {
  const [blogposts, setBlogposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { announce } = useAriaLive();

  useEffect(() => {
    document.title = `Blogposts  ${SITE_NAME}`;
    
    const fetchBlogposts = async () => {
      try {
        const { blogposts: data } = await blogpostsApi.list();
        setBlogposts(data || []);
      } catch (err) {
        setError("Failed to load blogposts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogposts();
  }, []);

  const filteredBlogposts = useMemo(() => {
    if (!searchQuery.trim()) return blogposts;
    const query = searchQuery.toLowerCase();
    return blogposts.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        (b.excerpt && b.excerpt.toLowerCase().includes(query))
    );
  }, [blogposts, searchQuery]);

  useEffect(() => {
    if (!loading && !error) {
      announce(`Found ${filteredBlogposts.length} blog posts matching your search.`);
    }
  }, [filteredBlogposts.length, loading, error, announce]);

  return (
    <Container className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Blogposts</h1>
        <p className={styles.subtitle}>Latest updates, guides, and stories from the community.</p>
      </header>
      
      <div className={styles.searchBar}>
        <label htmlFor="blog-search" className="sr-only">Search blog posts</label>
        <input 
          id="blog-search"
          type="search" 
          placeholder="Search by title or author..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <p role="status">Loading blogposts...</p>
      ) : error ? (
        <p style={{ color: "var(--error)" }}>{error}</p>
      ) : filteredBlogposts.length > 0 ? (
        <div className={styles.grid}>
          {filteredBlogposts.map(blogpost => (
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
        <p>No blogposts match your search. Please try different keywords.</p>
      )}
    </Container>
  );
}

