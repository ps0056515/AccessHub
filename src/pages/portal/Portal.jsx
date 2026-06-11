import { useEffect, useRef, useState, useMemo } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { TAG_COLORS, COLOR_MAP } from "data";
import { postsApi, eventsApi } from "api/client";
import { voteDelta } from "utils/voteDelta";
import { useAuth } from "context/AuthContext";
import { useConfig } from "context/ConfigContext";
import { useToast } from "context/ToastContext";
import { useAriaLive } from "context/AriaLiveContext";
import Container from "components/common/Container/Container";
import Pagination from "components/common/Pagination/Pagination";
import styles from "./Portal.module.css";

const TOPIC_FILTERS = ["WCAG 2.2", "Screen readers", "Legal"];

const MONTH_ABBRS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

function getEventTiming(eventDateStr) {
  if (!eventDateStr) return "upcoming";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(String(eventDateStr).slice(0, 10) + "T00:00:00");
  const diff = d - today;
  if (diff < 0) return "past";
  if (diff === 0) return "live";
  return "upcoming";
}

function fmtMonth(dateStr) {
  if (!dateStr) return "";
  return (
    MONTH_ABBRS[
      new Date(String(dateStr).slice(0, 10) + "T00:00:00Z").getUTCMonth()
    ] ?? ""
  );
}

function fmtDay(dateStr) {
  if (!dateStr) return "";
  return String(
    new Date(String(dateStr).slice(0, 10) + "T00:00:00Z").getUTCDate(),
  );
}

const HERO_TOPICS = [
  { label: "WCAG 2.2 implementations", searchText: "WCAG 2.2 implementations" },
  { label: "Screen reader testing", searchText: "Screen reader testing" },
  { label: "Legal & procurement", searchText: "Legal & procurement" },
  { label: "Design systems", searchText: "Design systems" },
];

function postMatchesQuery(post, rawQuery) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    post.title,
    post.excerpt,
    post.body,
    post.author,
    ...(post.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (haystack.includes(q)) return true;

  const tokens = q.split(/\s+/).filter((word) => word.length >= 3);
  if (tokens.length === 0) return haystack.includes(q);
  return tokens.every((word) => haystack.includes(word));
}

function Avatar({ initials, color, size = 36 }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: c.bg,
        color: c.text,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function Tag({ label }) {
  const c = TAG_COLORS[label] || { bg: "#f3f2ef", text: "#4a4840" };
  return (
    <span className={styles.tag} style={{ background: c.bg, color: c.text }}>
      {label}
    </span>
  );
}

function PostCard({
  post,
  onOpenThread,
  onVotesChange,
  isAuthenticated,
  navigate,
}) {
  const [votes, setVotes] = useState(post.votes);
  const [voted, setVoted] = useState(post.userVote || null);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState("");

  useEffect(() => {
    setVotes(post.votes);
    setVoted(post.userVote || null);
  }, [post.votes, post.userVote]);

  const vote = async (dir, e) => {
    e.stopPropagation();
    if (voting) return;

    if (!isAuthenticated) {
      navigate("/sign-in", { state: { from: `/` } });
      return;
    }
    const prevVotes = votes;
    const prevVoted = voted;
    const { delta, userVote: nextVoted } = voteDelta(voted, dir);

    setVoteError("");
    setVotes(prevVotes + delta);
    setVoted(nextVoted);
    setVoting(true);

    try {
      const { votes: newVotes, userVote } = await postsApi.vote(post.id, {
        direction: dir,
      });
      setVotes(newVotes);
      setVoted(userVote);
      onVotesChange?.(post.id, newVotes, userVote);
    } catch (err) {
      setVotes(prevVotes);
      setVoted(prevVoted);
      setVoteError(err.message || "Could not save your vote.");
    } finally {
      setVoting(false);
    }
  };

  return (
    <article className={styles.postCard}>
      <div className={styles.voteCol}>
        <button
          type="button"
          className={`${styles.voteBtn} ${voted === "up" ? styles.votedUp : ""}`}
          onClick={(e) => vote("up", e)}
          aria-label={`Upvote: ${post.title}`}
          aria-pressed={voted === "up"}
          disabled={voting}
        >
          ▲
        </button>
        <span
          className={styles.voteCount}
          aria-live="polite"
          aria-atomic="true"
        >
          {votes}
        </span>
        <button
          type="button"
          className={`${styles.voteBtn} ${voted === "down" ? styles.votedDown : ""}`}
          onClick={(e) => vote("down", e)}
          aria-label={`Downvote: ${post.title}`}
          aria-pressed={voted === "down"}
          disabled={voting}
        >
          ▼
        </button>
        {voteError ? (
          <span className="sr-only" role="alert">
            {voteError}
          </span>
        ) : null}
      </div>
      <Avatar initials={post.initials} color={post.color} />
      <button
        type="button"
        className={styles.postOpen}
        onClick={() => onOpenThread(post)}
        aria-label={`Open discussion: ${post.title}`}
      >
        <div className={styles.postBody}>
          <div className={styles.postMeta}>
            <span className={styles.postAuthor}>{post.author}</span>
            <span className={styles.postDot}>·</span>
            <span>{post.time}</span>
            <span className={styles.postDot}>·</span>
            <span>{post.replies} replies</span>
          </div>
          <h3 className={styles.postTitle}>{post.title}</h3>
          <p className={styles.postExcerpt}>{post.excerpt}</p>
          <div className={styles.postTags}>
            {post.tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
        </div>
      </button>
    </article>
  );
}

export default function Portal({
  setActivePage,
  goToSection,
  posts,
  setPosts,
  postsLoading,
  postsError,
  onRetryPosts,
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { portalConfig } = useConfig();
  const { addToast } = useToast();
  const { announce } = useAriaLive();
  const [activeTab, setActiveTab] = useState("hot");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const [query, setQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState(null);
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTags, setDraftTags] = useState([""]);
  const [postError, setPostError] = useState("");
  const [posting, setPosting] = useState(false);
  const askBoxRef = useRef(null);
  const askTextareaRef = useRef(null);
  const searchInputRef = useRef(null);
  const [topContributors, setTopContributors] = useState([]);

  useEffect(() => {
    postsApi
      .topContributors()
      .then((res) => setTopContributors(res.contributors || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const onFocusSearch = () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    };
    const onFocusAsk = () => {
      askBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      askTextareaRef.current?.focus();
    };
    window.addEventListener(
      "allcanaccess:focus-discussion-search",
      onFocusSearch,
    );
    window.addEventListener("allcanaccess:focus-ask", onFocusAsk);
    return () => {
      window.removeEventListener(
        "allcanaccess:focus-discussion-search",
        onFocusSearch,
      );
      window.removeEventListener("allcanaccess:focus-ask", onFocusAsk);
    };
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("aa-nav");
      if (!raw) return;
      const nav = JSON.parse(raw);
      if (nav.focusAsk) {
        sessionStorage.removeItem("aa-nav");
        askBoxRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        askTextareaRef.current?.focus();
      }
    } catch {
      /* ignore */
    }
  }, []);

  const focusDiscussionBox = () => {
    askBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    askTextareaRef.current?.focus();
  };

  const applyHeroTopic = (topic) => {
    const searchText = topic.searchText || topic.label;
    const isActive = query.trim().toLowerCase() === searchText.toLowerCase();

    if (isActive) {
      flushSync(() => {
        setTopicFilter(null);
        setQuery("");
      });
      return;
    }

    flushSync(() => {
      setQuery(searchText);
      setTopicFilter(null);
      setActiveTab("hot");
    });

    requestAnimationFrame(() => {
      searchInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      searchInputRef.current?.focus({ preventScroll: true });
    });
  };

  const applyFilterPill = (filter) => {
    const isActive = topicFilter === filter && query.trim() === filter;

    if (isActive) {
      setTopicFilter(null);
      setQuery("");
      return;
    }

    setTopicFilter(filter);
    setQuery(filter);
    setActiveTab("hot");
    searchInputRef.current?.focus();
  };

  const handleVotesChange = (postId, newVotes, userVote) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, votes: newVotes, userVote } : p,
      ),
    );
  };

  const goToCertificationsSection = () => {
    sessionStorage.setItem(
      "aa-nav",
      JSON.stringify({ scrollTo: "certifications" }),
    );
    setActivePage?.("resources");
  };
  const handlePostQuestion = async () => {
    const trimmedTitle = draftTitle.trim();
    const trimmedQuestion = draftQuestion.trim();

    if (!trimmedTitle) {
      setPostError("Please enter a title.");
      return;
    }

    if (!draftTags[0]) {
      setPostError("Please select a topic.");
      return;
    }

    if (!isAuthenticated) {
      navigate("/sign-in", { state: { from: "/" } });
      return;
    }
    setPostError("");
    setPosting(true);
    try {
      const title = trimmedTitle;
      const { post: newPost } = await postsApi.create({
        title: trimmedTitle,
        body: trimmedQuestion || null,
        tags: draftTags,
      });

      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setDraftTitle("");
      setDraftQuestion("");
      setDraftTags([""]);
      setQuery("");
      setActiveTab("new");
      addToast("Discussion posted successfully!", "success");
      navigate(`/thread/${newPost.id}`);
    } catch (err) {
      setPostError(err.message || "Could not post your question.");
    } finally {
      setPosting(false);
    }
  };

  const tabs = [
    { id: "hot", label: "🔥 Hot" },
    { id: "new", label: "✨ New" },
    { id: "top", label: "⬆ Top" },
    { id: "unanswered", label: "💬 Unanswered" },
  ];

  const baseFiltered = useMemo(() => {
    return posts.filter((p) => {
      if (topicFilter && !p.tags.includes(topicFilter)) return false;
      return postMatchesQuery(p, query);
    });
  }, [posts, query, topicFilter]);

  const tabFiltered = useMemo(() => {
    const list = [...baseFiltered];
    if (activeTab === "hot") {
      return [...list].sort((a, b) => {
        const scoreA = a.votes + (a.id > 100 ? 0 : 2);
        const scoreB = b.votes + (b.id > 100 ? 0 : 2);
        return scoreB - scoreA;
      });
    }
    if (activeTab === "new") return list.sort((a, b) => b.id - a.id);
    if (activeTab === "top") return list.sort((a, b) => b.votes - a.votes);
    if (activeTab === "unanswered") return list.filter((p) => p.replies === 0);
    return list;
  }, [baseFiltered, activeTab]);

  useEffect(() => {
    announce(`Filters applied: ${tabFiltered.length} discussions found.`);
  }, [tabFiltered.length, announce]);

  const totalPages = Math.ceil(tabFiltered.length / postsPerPage) || 1;
  const paginatedPosts = tabFiltered.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, query, topicFilter]);

  const [sidebarEvents, setSidebarEvents] = useState(() => []);

  useEffect(() => {
    eventsApi
      .list()
      .then((data) => {
        if (Array.isArray(data)) {
          setSidebarEvents(
            data
              .filter((e) => {
                const timing = getEventTiming(e.event_date);
                return timing === "upcoming" || timing === "live";
              })
              .slice(0, 4),
          );
        }
      })
      .catch(() => {});
  }, []);

  const goToEvent = (id) => {
    try {
      sessionStorage.setItem("aa-nav", JSON.stringify({ focusEventId: id }));
    } catch {
      /* ignore */
    }
    if (typeof goToSection === "function") goToSection("events");
    else setActivePage?.("events");
  };

  const goToAllEvents = () => {
    if (typeof goToSection === "function") goToSection("events");
    else setActivePage?.("events");
  };

  let heroAlignStyle = { position: "relative", zIndex: 1 };
  let overlayBackground = "";
  const opacity = portalConfig.bgOpacity ?? 0.8;

  if (portalConfig.contentPosition === "center") {
    heroAlignStyle.margin = "0 auto";
    overlayBackground = `radial-gradient(circle at center, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,0) 75%)`;
  } else if (portalConfig.contentPosition === "right") {
    heroAlignStyle.margin = "0 0 0 auto";
    overlayBackground = `linear-gradient(to left, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,0) 100%)`;
  } else {
    heroAlignStyle.margin = "0 auto 0 0";
    overlayBackground = `linear-gradient(to right, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,0) 100%)`;
  }

  return (
    <div className={styles.page}>
      <section
        className={styles.hero}
        aria-labelledby="hero-heading"
        style={
          portalConfig.bgUrl
            ? {
                backgroundImage: `url(${portalConfig.bgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {portalConfig.bgUrl && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: overlayBackground,
            }}
          />
        )}
        <Container className={styles.heroInner} style={heroAlignStyle}>
          {portalConfig.badge && (
            <div className={styles.heroBadge}>
              <span className={styles.heroDot} aria-hidden="true" />
              {portalConfig.badge}
            </div>
          )}
          {portalConfig.heading && (
            <h1
              id="hero-heading"
              className={`${styles.heroTitle} fade-up`}
              style={{ whiteSpace: "pre-line" }}
            >
              {portalConfig.heading}
            </h1>
          )}
          {portalConfig.subheading && (
            <p className={`${styles.heroSub} fade-up fade-up-1`}>
              {portalConfig.subheading}
            </p>
          )}
          <ul
            className={`${styles.heroChips} fade-up fade-up-1`}
            aria-label="Popular topics"
          >
            {(portalConfig.tags || []).map((topic) => {
              const searchText = topic.searchText || topic.label;
              const isActive =
                query.trim().toLowerCase() === searchText.toLowerCase();
              return (
                <li key={topic.label}>
                  <button
                    type="button"
                    className={`${styles.heroChipBtn} ${isActive ? styles.heroChipBtnActive : ""}`}
                    aria-pressed={isActive}
                    onClick={() => applyHeroTopic(topic)}
                  >
                    {topic.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className={`${styles.heroActions} fade-up fade-up-2`}>
            <button
              type="button"
              className={styles.heroCta}
              onClick={focusDiscussionBox}
            >
              Start a discussion
            </button>
            <button
              type="button"
              className={styles.heroSecondary}
              onClick={goToCertificationsSection}
            >
              Explore certifications
            </button>
          </div>
        </Container>
        {!portalConfig.bgUrl && (
          <div className={styles.heroDecor} aria-hidden="true">
            <div className={styles.decorCircle1} />
            <div className={styles.decorCircle2} />
            <div className={styles.decorLine} />
          </div>
        )}
      </section>

      <Container className={styles.statsBar} aria-label="Community statistics">
        {(portalConfig.stats || []).map((s, i) => (
          <div
            key={i}
            className={`${styles.statItem} fade-up`}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <span className={styles.statNum}>{s.num}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </Container>

      <Container className={styles.mainGrid}>
        <main className={styles.feed}>
          <div className={styles.askBox} ref={askBoxRef}>
            <p className={styles.askLabel}>Ask the community</p>
            <label className={styles.fieldLabel}>
              Title <span aria-hidden="true">*</span>
            </label>

            <input
              type="text"
              className={styles.askTitleInput}
              placeholder="Ask the community a question..."
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              aria-required="true"
            />

            <label className={styles.fieldLabel}>Description (Optional)</label>

            <textarea
              className={styles.askTextarea}
              ref={askTextareaRef}
              placeholder="Provide additional details, context, or examples (optional)"
              rows={3}
              aria-label="Question description"
              value={draftQuestion}
              onChange={(e) => setDraftQuestion(e.target.value)}
            />
            {postError && (
              <p className={styles.askError} role="alert">
                {postError}
              </p>
            )}
            <div className={styles.askFooter}>
              <label className={styles.topicPicker} htmlFor="ask-topic">
                <span className={styles.topicPickerLabel}>Choose topic</span>
                <select
                  id="ask-topic"
                  className={styles.topicSelect}
                  value={draftTags[0]}
                  onChange={(e) => setDraftTags([e.target.value])}
                  disabled={posting}
                >
                  <option value="">Select Topic</option>

                  {(portalConfig.askTopics || []).map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className={styles.askPost}
                onClick={handlePostQuestion}
                disabled={posting}
              >
                {posting ? "Posting…" : "Post question →"}
              </button>
            </div>
          </div>
          <div className={styles.searchRow}>
            <label htmlFor="search" className="sr-only">
              Search discussions
            </label>
            <div className={styles.searchWrap}>
              <svg
                className={styles.searchIcon}
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="6.5"
                  cy="6.5"
                  r="4.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M10 10L13.5 13.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <input
                ref={searchInputRef}
                id="search"
                className={styles.searchInput}
                type="search"
                placeholder={
                  portalConfig.searchPlaceholder ||
                  "Search discussions by title or text…"
                }
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setTopicFilter(null);
                }}
              />
            </div>
            <div
              className={styles.filterPills}
              role="toolbar"
              aria-label="Filter discussions by topic"
            >
              {TOPIC_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={topicFilter === f}
                  className={`${styles.filterPill} ${topicFilter === f ? styles.filterPillActive : ""}`}
                  onClick={() => applyFilterPill(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div
            className={styles.tabBar}
            role="tablist"
            aria-label="Discussion filter"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                className={`${styles.tabBtn} ${activeTab === t.id ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            className={styles.postsContainer}
            role="tabpanel"
            aria-label={`${activeTab} discussions`}
          >
            {postsLoading ? (
              <p className={styles.empty}>Loading discussions…</p>
            ) : postsError ? (
              <div className={styles.empty}>
                <p>{postsError}</p>
                <button
                  type="button"
                  className={styles.retryBtn}
                  onClick={onRetryPosts}
                >
                  Try again
                </button>
              </div>
            ) : paginatedPosts.length === 0 ? (
              <p className={styles.empty}>
                {query.trim()
                  ? `No discussions match “${query.trim()}”. Try another word or clear the search.`
                  : topicFilter
                    ? `No discussions in “${topicFilter}” with the current tab. Try another topic or tab.`
                    : "No discussions match your filters."}
              </p>
            ) : (
              paginatedPosts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onOpenThread={(post) => navigate(`/thread/${post.id}`)}
                  isAuthenticated={isAuthenticated}
                  navigate={navigate}
                  onVotesChange={handleVotesChange}
                />
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </main>

        <aside className={styles.sidebar} aria-label="Community sidebar">
          <section
            className={styles.sideSection}
            aria-labelledby="events-heading"
          >
            <h2 id="events-heading" className={styles.sideTitle}>
              Upcoming events
            </h2>
            <ul className={styles.eventList}>
              {sidebarEvents.map((e) => (
                <li key={e.id} className={styles.eventItem}>
                  <button
                    type="button"
                    className={styles.eventRowBtn}
                    onClick={() => goToEvent(e.id)}
                  >
                    <div className={styles.eventDate}>
                      <span className={styles.eventMonth}>
                        {fmtMonth(e.event_date)}
                      </span>
                      <span className={styles.eventDay}>
                        {fmtDay(e.event_date)}
                      </span>
                    </div>
                    <div className={styles.eventRowText}>
                      <p className={styles.eventTitle}>{e.title}</p>
                      <p className={styles.eventType}>{e.type}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={styles.sideLink}
              onClick={goToAllEvents}
            >
              View all events →
            </button>
          </section>

          <section
            className={styles.sideSection}
            aria-labelledby="contributors-heading"
          >
            <h2 id="contributors-heading" className={styles.sideTitle}>
              Top contributors
            </h2>
            <ul className={styles.memberList}>
              {topContributors.map((m) => (
                <li key={m.id} className={styles.memberItem}>
                  <button
                    type="button"
                    className={styles.memberRowBtn}
                    onClick={() => navigate(`/profile/${m.id}`)}
                    aria-label={`View public profile: ${m.name}`}
                  >
                    <Avatar initials={m.initials} color={m.color} size={32} />
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>{m.name}</span>
                      <span className={styles.memberRole}>{m.role}</span>
                    </div>
                    {m.hot ? (
                      <span
                        className={styles.hotBadge}
                        aria-label="Hot contributor"
                      >
                        🔥
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={styles.quickChecker}
            aria-labelledby="checker-heading"
          >
            <h2 id="checker-heading" className={styles.sideTitle}>
              Quick WAVE scan
            </h2>
            <p className={styles.checkerDesc}>
              Paste any URL for an instant accessibility scan
            </p>
            <label htmlFor="wave-url" className="sr-only">
              Website URL
            </label>
            <input
              id="wave-url"
              className={styles.checkerInput}
              type="url"
              placeholder="https://yoursite.com"
            />
            <button
              type="button"
              className={styles.checkerBtn}
              onClick={() => {
                const el = document.getElementById("wave-url");
                const url = el?.value?.trim();
                if (url)
                  window.open(
                    `https://wave.webaim.org/report#/${encodeURIComponent(url)}`,
                    "_blank",
                  );
              }}
            >
              Run scan →
            </button>
          </section>
        </aside>
      </Container>
    </div>
  );
}
