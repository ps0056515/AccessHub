import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATS, ALL_EVENTS, MEMBERS, TAG_COLORS, COLOR_MAP } from '../data';
import styles from './Portal.module.css';

const TOPIC_FILTERS = ['WCAG 2.2', 'Screen readers', 'Legal'];

function postMatchesQuery(post, rawQuery) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const haystack = [post.title, post.excerpt, post.body, post.author, ...(post.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
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
  const c = TAG_COLORS[label] || { bg: '#f3f2ef', text: '#4a4840' };
  return (
    <span className={styles.tag} style={{ background: c.bg, color: c.text }}>
      {label}
    </span>
  );
}

function PostCard({ post, onOpenThread }) {
  const [votes, setVotes] = useState(post.votes);
  const [voted, setVoted] = useState(null);

  const vote = (dir, e) => {
    e.stopPropagation();
    if (voted === dir) {
      setVotes(post.votes);
      setVoted(null);
    } else {
      setVotes(post.votes + (dir === 'up' ? 1 : -1));
      setVoted(dir);
    }
  };

  return (
    <article className={styles.postCard}>
      <div className={styles.voteCol}>
        <button
          type="button"
          className={`${styles.voteBtn} ${voted === 'up' ? styles.votedUp : ''}`}
          onClick={e => vote('up', e)}
          aria-label={`Upvote: ${post.title}`}
        >
          ▲
        </button>
        <span className={styles.voteCount}>{votes}</span>
        <button
          type="button"
          className={`${styles.voteBtn} ${voted === 'down' ? styles.votedDown : ''}`}
          onClick={e => vote('down', e)}
          aria-label={`Downvote: ${post.title}`}
        >
          ▼
        </button>
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
            {post.tags.map(t => (
              <Tag key={t} label={t} />
            ))}
          </div>
        </div>
      </button>
    </article>
  );
}

export default function Portal({ setActivePage, goToSection, posts, setPosts }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hot');
  const [query, setQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState(null);
  const [draftQuestion, setDraftQuestion] = useState('');
  const askBoxRef = useRef(null);
  const askTextareaRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const onFocusSearch = () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    const onFocusAsk = () => {
      askBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      askTextareaRef.current?.focus();
    };
    window.addEventListener('allcanaccess:focus-discussion-search', onFocusSearch);
    window.addEventListener('allcanaccess:focus-ask', onFocusAsk);
    return () => {
      window.removeEventListener('allcanaccess:focus-discussion-search', onFocusSearch);
      window.removeEventListener('allcanaccess:focus-ask', onFocusAsk);
    };
  }, []);

  const focusDiscussionBox = () => {
    askBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    askTextareaRef.current?.focus();
  };

  const goToCertificationsSection = () => {
    sessionStorage.setItem('aa-nav', JSON.stringify({ scrollTo: 'certifications' }));
    setActivePage?.('resources');
  };

  const handlePostQuestion = () => {
    const trimmedQuestion = draftQuestion.trim();
    if (!trimmedQuestion) {
      askTextareaRef.current?.focus();
      return;
    }

    const newPost = {
      id: Date.now(),
      votes: 0,
      initials: 'YU',
      color: 'blue',
      author: 'You',
      role: 'Community member',
      time: 'Just now',
      replies: 0,
      title: trimmedQuestion,
      excerpt:
        'Thanks for posting. Community members can now respond to your question.',
      body:
        'Your question is live. Others can reply once the thread is indexed. Edit details from your profile (coming soon).',
      tags: ['WCAG 2.2'],
      tagColors: ['blue'],
    };

    setPosts(prevPosts => [newPost, ...prevPosts]);
    setDraftQuestion('');
    setQuery('');
    setActiveTab('new');
    navigate(`/thread/${newPost.id}`);
  };

  const tabs = [
    { id: 'hot', label: '🔥 Hot' },
    { id: 'new', label: '✨ New' },
    { id: 'top', label: '⬆ Top' },
    { id: 'unanswered', label: '💬 Unanswered' },
  ];

  const baseFiltered = useMemo(() => {
    return posts.filter(p => {
      if (topicFilter && !p.tags.includes(topicFilter)) return false;
      return postMatchesQuery(p, query);
    });
  }, [posts, query, topicFilter]);

  const tabFiltered = useMemo(() => {
    const list = [...baseFiltered];
    if (activeTab === 'hot') {
      return [...list].sort((a, b) => {
        const scoreA = a.votes + (a.id > 100 ? 0 : 2);
        const scoreB = b.votes + (b.id > 100 ? 0 : 2);
        return scoreB - scoreA;
      });
    }
    if (activeTab === 'new') return list.sort((a, b) => b.id - a.id);
    if (activeTab === 'top') return list.sort((a, b) => b.votes - a.votes);
    if (activeTab === 'unanswered') return list.filter(p => p.replies === 0);
    return list;
  }, [baseFiltered, activeTab]);

  const sidebarEvents = useMemo(() => {
    const upcoming = ALL_EVENTS.filter(
      e => e.timing === 'upcoming' || e.timing === 'live'
    );
    return upcoming.slice(0, 4);
  }, []);

  const goToEvent = id => {
    try {
      sessionStorage.setItem('aa-nav', JSON.stringify({ focusEventId: id }));
    } catch {
      /* ignore */
    }
    if (typeof goToSection === 'function') goToSection('events');
    else setActivePage?.('events');
  };

  const goToAllEvents = () => {
    if (typeof goToSection === 'function') goToSection('events');
    else setActivePage?.('events');
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <span className={styles.heroDot} aria-hidden="true" />
            Live community · weekly office hours
          </div>
          <h1 id="hero-heading" className={`${styles.heroTitle} fade-up`}>
            Where <em>accessibility</em>
            <br />
            practitioners connect
          </h1>
          <p className={`${styles.heroSub} fade-up fade-up-1`}>
            Crowd-sourced discussions, vetted guides, tooling, and events — built with practitioners who ship inclusive
            products in the real world.
          </p>
          <ul className={`${styles.heroChips} fade-up fade-up-1`} aria-label="Popular topics">
            <li>WCAG 2.2 implementations</li>
            <li>Screen reader testing</li>
            <li>Legal &amp; procurement</li>
            <li>Design systems</li>
          </ul>
          <div className={`${styles.heroActions} fade-up fade-up-2`}>
            <button type="button" className={styles.heroCta} onClick={focusDiscussionBox}>
              Start a discussion
            </button>
            <button type="button" className={styles.heroSecondary} onClick={goToCertificationsSection}>
              Explore certifications
            </button>
          </div>
        </div>
        <div className={styles.heroDecor} aria-hidden="true">
          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
          <div className={styles.decorLine} />
        </div>
      </section>

      <section className={styles.statsBar} aria-label="Community statistics">
        {STATS.map((s, i) => (
          <div
            key={i}
            className={`${styles.statItem} fade-up`}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <span className={styles.statNum}>{s.num}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      <div className={styles.mainGrid}>
        <main className={styles.feed}>
          <div className={styles.searchRow}>
            <label htmlFor="search" className="sr-only">
              Search discussions
            </label>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                ref={searchInputRef}
                id="search"
                className={styles.searchInput}
                type="search"
                placeholder="Search discussions by title or text…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div className={styles.filterPills} role="toolbar" aria-label="Filter discussions by topic">
              {TOPIC_FILTERS.map(f => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={topicFilter === f}
                  className={`${styles.filterPill} ${topicFilter === f ? styles.filterPillActive : ''}`}
                  onClick={() => setTopicFilter(prev => (prev === f ? null : f))}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.askBox} ref={askBoxRef}>
            <p className={styles.askLabel}>Ask the community</p>
            <textarea
              className={styles.askTextarea}
              ref={askTextareaRef}
              placeholder="What accessibility challenge are you working through?"
              rows={3}
              aria-label="Write your question"
              value={draftQuestion}
              onChange={e => setDraftQuestion(e.target.value)}
            />
            <div className={styles.askFooter}>
              <button type="button" className={styles.askTopic}>
                Choose topic
              </button>
              <button type="button" className={styles.askPost} onClick={handlePostQuestion}>
                Post question →
              </button>
            </div>
          </div>

          <div className={styles.tabBar} role="tablist" aria-label="Discussion filter">
            {tabs.map(t => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                className={`${styles.tabBtn} ${activeTab === t.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" aria-label={`${activeTab} discussions`}>
            {tabFiltered.length === 0 ? (
              <p className={styles.empty}>
                {query.trim()
                  ? `No discussions match “${query.trim()}”. Try another word or clear the search.`
                  : topicFilter
                    ? `No discussions in “${topicFilter}” with the current tab. Try another topic or tab.`
                    : 'No discussions match your filters.'}
              </p>
            ) : (
              tabFiltered.map(p => (
                <PostCard key={p.id} post={p} onOpenThread={post => navigate(`/thread/${post.id}`)} />
              ))
            )}
          </div>
        </main>

        <aside className={styles.sidebar} aria-label="Community sidebar">
          <section className={styles.sideSection} aria-labelledby="events-heading">
            <h2 id="events-heading" className={styles.sideTitle}>
              Upcoming events
            </h2>
            <ul className={styles.eventList}>
              {sidebarEvents.map(e => (
                <li key={e.id} className={styles.eventItem}>
                  <button type="button" className={styles.eventRowBtn} onClick={() => goToEvent(e.id)}>
                    <div className={styles.eventDate}>
                      <span className={styles.eventMonth}>{e.month}</span>
                      <span className={styles.eventDay}>{e.day}</span>
                    </div>
                    <div className={styles.eventRowText}>
                      <p className={styles.eventTitle}>{e.title}</p>
                      <p className={styles.eventType}>{e.type}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className={styles.sideLink} onClick={goToAllEvents}>
              View all events →
            </button>
          </section>

          <section className={styles.sideSection} aria-labelledby="contributors-heading">
            <h2 id="contributors-heading" className={styles.sideTitle}>
              Top contributors
            </h2>
            <ul className={styles.memberList}>
              {MEMBERS.map(m => (
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
                      <span className={styles.hotBadge} aria-label="Hot contributor">
                        🔥
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.sideSection} aria-labelledby="checker-heading">
            <h2 id="checker-heading" className={styles.sideTitle}>
              Quick WAVE scan
            </h2>
            <p className={styles.checkerDesc}>Paste any URL for an instant accessibility scan</p>
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
                const el = document.getElementById('wave-url');
                const url = el?.value?.trim();
                if (url) window.open(`https://wave.webaim.org/report#/${encodeURIComponent(url)}`, '_blank');
              }}
            >
              Run scan →
            </button>
          </section>
        </aside>
      </div>

    </div>
  );
}
