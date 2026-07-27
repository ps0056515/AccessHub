import { useLayoutEffect, useMemo, useState, useEffect } from "react";
import { useToast } from "context/ToastContext";
import { useAriaLive } from "context/AriaLiveContext";
import { COLOR_MAP } from "data";
import { resourcesApi } from "api/client";
import SuggestResourceModal from "./SuggestResourceModal";
import Container from "components/common/Container/Container";
import SEO from "components/common/SEO/SEO";
import Badge from "components/common/Badge/Badge";
import styles from "./Resources.module.css";

const SAVED_KEY = "allcanaccess-saved-resources";
const SUBMISSIONS_KEY = "allcanaccess-resource-submissions";

function loadSaved() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

export default function Resources({ setActivePage }) {
  const { addToast } = useToast();
  const { announce } = useAriaLive();
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(loadSaved);
  const [submitOpen, setSubmitOpen] = useState(false);

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resourcesApi
      .list()
      .then((data) => {
        if (Array.isArray(data)) setResources(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useLayoutEffect(() => {
    const raw = sessionStorage.getItem("aa-nav");
    if (!raw) return;
    try {
      const { scrollTo, focusEventId } = JSON.parse(raw);
      if (scrollTo === "certifications") {
        requestAnimationFrame(() => {
          document.getElementById("resource-certifications")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }
      if (focusEventId) {
        /* consumed by Events page */
      }
    } catch {
      /* ignore */
    } finally {
      sessionStorage.removeItem("aa-nav");
    }
  }, []);

  const dynamicCategories = useMemo(() => {
    const unique = new Set();
    resources.forEach(r => {
      if (r.category) unique.add(r.category);
    });
    return ["All", ...Array.from(unique)];
  }, [resources]);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (activeCategory !== "All" && r.category !== activeCategory)
        return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, query, resources]);

  useEffect(() => {
    announce(`Filters applied: ${filtered.length} resources found.`);
  }, [filtered.length, activeCategory, query, announce]);

  const toggleSave = (slug) => {
    setSaved((prev) => {
      const next = new Set(prev);
      const isCurrentlySaved = next.has(slug);
      if (isCurrentlySaved) next.delete(slug);
      else next.add(slug);
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
      } catch {
        /* private mode / quota — state still updates this session */
      }
      addToast(isCurrentlySaved ? "Resource removed from saved list." : "Resource saved successfully.", "success");
      return next;
    });
  };

  const closeSubmit = () => {
    setSubmitOpen(false);
  };

  return (
    <Container className={styles.page}>
      <SEO 
        title="Resources | AllCanAccess"
        description="Access the ultimate library of digital accessibility resources. Download free WCAG checklists, inclusive design templates, ARIA pattern guides, and step-by-step accessibility tutorials curated by top industry professionals."
        keywords="accessibility resources, WCAG checklists, inclusive design templates, ARIA tutorials, web accessibility guides, accessibility best practices, digital accessibility learning, accessibility testing templates, ADA compliance checklist, Section 508 guides, screen reader guides, accessibility documentation, accessible HTML templates, CSS accessibility, accessible UI patterns, accessibility cheat sheets, accessible color contrast guides, a11y resources, mobile accessibility guidelines, iOS accessibility resources, Android accessibility guides, accessibility training materials, accessibility code snippets, WCAG 2.2 tutorials, accessible design systems"
      />
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Community resources</h1>
        <p className={styles.pageSub}>
          Guides, templates, checklists and references curated by the
          AllCanAccess community.
        </p>
      </header>

      <section
        id="resource-certifications"
        className={styles.certBanner}
        aria-labelledby="cert-heading"
      >
        <div>
          <h2 id="cert-heading" className={styles.certHeading}>
            Certifications &amp; learning paths
          </h2>
          <p className={styles.certDesc}>
            IAAP credentials, WAS, and structured training tracks — pair these
            with the checklist resources below.
          </p>
        </div>
        <button
          type="button"
          className={styles.certCta}
          onClick={() => setActivePage?.("tools")}
        >
          Open tools &amp; certifications →
        </button>
      </section>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <label htmlFor="res-search" className="sr-only">
            Search resources
          </label>
          <input
            id="res-search"
            className={styles.searchInput}
            type="search"
            placeholder="Search resources…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <fieldset className={styles.catFieldset}>
          <legend className="sr-only">Filter by category</legend>
          <div className={styles.catNav}>
            {dynamicCategories.map((c) => (
              <label
                key={c}
                className={`${styles.catLabel} ${activeCategory === c ? styles.catActive : ""}`}
              >
                <input
                  type="radio"
                  name="resource-category"
                  className={styles.catInput}
                  value={c}
                  checked={activeCategory === c}
                  onChange={() => setActiveCategory(c)}
                />
                <span className={styles.catText}>{c}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className={styles.grid}>
        {filtered.map((r, i) => {
          const c = COLOR_MAP[r.color] || COLOR_MAP.blue;
          const isSaved = saved.has(r.slug);
          return (
            <article
              key={r.slug}
              className={`${styles.card} fade-up`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <Badge
                as="div"
                className={styles.cardIcon}
                bg={c.bg}
              >
                <span role="img" aria-hidden="true" style={{ fontSize: 20 }}>
                  {r.icon}
                </span>
              </Badge>
              <div className={styles.cardBody}>
                <p className={styles.cardCat}>{r.category}</p>
                <h2 className={styles.cardTitle}>{r.title}</h2>
                <p className={styles.cardDesc}>{r.desc}</p>
              </div>
              <div className={styles.cardActions}>
                <a
                  className={styles.cardBtn}
                  href={r.view_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  View <span className="sr-only">{r.title}</span> <span aria-hidden="true">→</span>
                </a>
                <button
                  type="button"
                  className={`${styles.cardSave} ${isSaved ? styles.cardSaveOn : ""}`}
                  aria-label={
                    isSaved
                      ? `Remove from saved: ${r.title}`
                      : `Save for later: ${r.title}`
                  }
                  title={isSaved ? `Remove from saved: ${r.title}` : `Save for later: ${r.title}`}
                  aria-pressed={isSaved}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSave(r.slug);
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 1h10v12l-5-3-5 3V1z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      fill={isSaved ? "currentColor" : "none"}
                    />
                  </svg>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {loading && resources.length === 0 ? (
        <p className={styles.loading}>Loading resources...</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>
          {query.trim()
            ? `No resources found for “${query.trim()}” in this category.`
            : `No resources in “${activeCategory}”. Try another category.`}
        </p>
      ) : null}

      <div className={styles.submitBanner}>
        <div>
          <h2 className={styles.bannerTitle}>Have a resource to share?</h2>
          <p className={styles.bannerSub}>
            Submit it for community review and help practitioners worldwide.
          </p>
        </div>
        <button
          type="button"
          className={styles.bannerBtn}
          onClick={() => setSubmitOpen(true)}
        >
          Submit a resource →
        </button>
      </div>

      <SuggestResourceModal isOpen={submitOpen} onClose={closeSubmit} />
    </Container>
  );
}
