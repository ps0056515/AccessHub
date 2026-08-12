import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { screenReadersApi } from "api/client";
import Container from "components/common/Container/Container";
import { useAriaLive } from "context/AriaLiveContext";
import styles from "./ScreenReaders.module.css";

export default function ScreenReadersList() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const { announce } = useAriaLive();

  useEffect(() => {
    document.title = "Screen Readers  AllCanAccess";
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const res = await screenReadersApi.list();
      setGuides(res.data || []);
    } catch (err) {
      setError("Failed to load screen reader guides.");
    } finally {
      setLoading(false);
    }
  };

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return guides;
    const query = searchQuery.toLowerCase();
    return guides.filter(
      (g) =>
        g.title.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query)
    );
  }, [guides, searchQuery]);

  useEffect(() => {
    if (!loading && !error) {
      announce(`Found ${filteredGuides.length} screen reader guides matching your search.`);
    }
  }, [filteredGuides.length, loading, error, announce]);

  if (loading) return <Container className={styles.container} role="status">Loading guides...</Container>;
  if (error) return <Container className={styles.container}>{error}</Container>;

  return (
    <Container className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Screen Readers</h1>
        <p className={styles.subtitle}>
          Comprehensive guides and testing checklists for standard assistive technologies.
        </p>
      </header>

      <div className={styles.searchBar} style={{ marginBottom: "2rem" }}>
        <label htmlFor="sr-search" className="sr-only">Search screen readers</label>
        <div className={styles.searchWrapper}>
          <input 
            ref={searchInputRef}
            id="sr-search"
            type="search" 
            placeholder="Search by OS, platform, or name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.searchClearBtn}
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              &#x2715;
            </button>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {filteredGuides.map(guide => (
          <Link key={guide.id} to={`/screen-readers/${guide.id}`} className={styles.card}>
            <h2 className={styles.cardTitle}>{guide.title}</h2>
            <p className={styles.cardBody}>{guide.description}</p>
            <span className={styles.cardFooter}>
              View guide <span className={styles.arrow} aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
      
      {filteredGuides.length === 0 && guides.length > 0 && (
        <p>No guides match your search. Please try different keywords.</p>
      )}

      {guides.length === 0 && (
        <p>No guides available at this time.</p>
      )}
    </Container>
  );
}

