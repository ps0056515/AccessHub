import { useRef, useState } from 'react';
import { STATS, POSTS, EVENTS, MEMBERS, TAG_COLORS, COLOR_MAP } from '../data';
import styles from './Portal.module.css';

function Avatar({ initials, color, size = 36 }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div
      className={styles.avatar}
      style={{
        width: size, height: size, fontSize: size * 0.36,
        background: c.bg, color: c.text,
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

function PostCard({ post }) {
  const [votes, setVotes] = useState(post.votes);
  const [voted, setVoted] = useState(null);

  const vote = (dir) => {
    if (voted === dir) { setVotes(post.votes); setVoted(null); }
    else { setVotes(post.votes + (dir === 'up' ? 1 : -1)); setVoted(dir); }
  };

  return (
    <article className={styles.postCard}>
      <div className={styles.voteCol}>
        <button
          className={`${styles.voteBtn} ${voted === 'up' ? styles.votedUp : ''}`}
          onClick={() => vote('up')}
          aria-label={`Upvote: ${post.title}`}
        >▲</button>
        <span className={styles.voteCount}>{votes}</span>
        <button
          className={`${styles.voteBtn} ${voted === 'down' ? styles.votedDown : ''}`}
          onClick={() => vote('down')}
          aria-label={`Downvote: ${post.title}`}
        >▼</button>
      </div>
      <Avatar initials={post.initials} color={post.color} />
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
          {post.tags.map(t => <Tag key={t} label={t} />)}
        </div>
      </div>
    </article>
  );
}

export default function Portal({ setActivePage }) {
  const [activeTab, setActiveTab] = useState('hot');
  const [posts, setPosts] = useState(POSTS);
  const [query, setQuery] = useState('');
  const [draftQuestion, setDraftQuestion] = useState('');
  const askBoxRef = useRef(null);
  const askTextareaRef = useRef(null);

  const focusDiscussionBox = () => {
    askBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    askTextareaRef.current?.focus();
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
      excerpt: 'Thanks for posting. Community members can now respond to your question.',
      tags: ['WCAG 2.2'],
      tagColors: ['blue'],
    };

    setPosts(prevPosts => [newPost, ...prevPosts]);
    setDraftQuestion('');
    setQuery('');
    setActiveTab('new');
    askTextareaRef.current?.focus();
  };

  const tabs = [
    { id: 'hot',    label: '🔥 Hot' },
    { id: 'new',    label: '✨ New' },
    { id: 'top',    label: '⬆ Top' },
    { id: 'unanswered', label: '💬 Unanswered' },
  ];

  const filtered = posts.filter(p =>
    !query || p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <span className={styles.heroDot} aria-hidden="true" />
            Community Portal
          </div>
          <h1 id="hero-heading" className={`${styles.heroTitle} fade-up`}>
            Where <em>accessibility</em><br />practitioners connect
          </h1>
          <p className={`${styles.heroSub} fade-up fade-up-1`}>
            Discussions, resources, tools, and events for web accessibility professionals,
            designers, developers, and advocates worldwide.
          </p>
          <div className={`${styles.heroActions} fade-up fade-up-2`}>
            <button className={styles.heroCta} onClick={focusDiscussionBox}>
              Start a discussion
            </button>
            <button
              className={styles.heroSecondary}
              onClick={() => setActivePage?.('tools')}
            >
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

      {/* ── Stats ── */}
      <section className={styles.statsBar} aria-label="Community statistics">
        {STATS.map((s, i) => (
          <div key={i} className={`${styles.statItem} fade-up`} style={{ animationDelay: `${i * 0.07}s` }}>
            <span className={styles.statNum}>{s.num}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Main grid ── */}
      <div className={styles.mainGrid}>
        <main className={styles.feed} id="main-content">
          {/* Search */}
          <div className={styles.searchRow}>
            <label htmlFor="search" className="sr-only">Search discussions</label>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                id="search"
                className={styles.searchInput}
                type="search"
                placeholder="Search discussions, resources, tools…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div className={styles.filterPills} role="list" aria-label="Filter by topic">
              {['WCAG 2.2', 'Screen readers', 'Legal'].map(f => (
                <button key={f} className={styles.filterPill} role="listitem">{f}</button>
              ))}
            </div>
          </div>

          {/* Ask box */}
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
              <button className={styles.askTopic}>Choose topic</button>
              <button className={styles.askPost} onClick={handlePostQuestion}>
                Post question →
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabBar} role="tablist" aria-label="Discussion filter">
            {tabs.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTab === t.id}
                className={`${styles.tabBtn} ${activeTab === t.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Post list */}
          <div role="tabpanel" aria-label={`${activeTab} discussions`}>
            {filtered.length === 0 ? (
              <p className={styles.empty}>No discussions match "{query}"</p>
            ) : (
              filtered.map(p => <PostCard key={p.id} post={p} />)
            )}
          </div>
        </main>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar} aria-label="Community sidebar">
          {/* Events */}
          <section className={styles.sideSection} aria-labelledby="events-heading">
            <h2 id="events-heading" className={styles.sideTitle}>Upcoming events</h2>
            <ul className={styles.eventList}>
              {EVENTS.slice(0, 4).map((e, i) => (
                <li key={i} className={styles.eventItem}>
                  <div className={styles.eventDate}>
                    <span className={styles.eventMonth}>{e.month}</span>
                    <span className={styles.eventDay}>{e.day}</span>
                  </div>
                  <div>
                    <p className={styles.eventTitle}>{e.title}</p>
                    <p className={styles.eventType}>{e.type}</p>
                  </div>
                </li>
              ))}
            </ul>
            <button className={styles.sideLink}>View all events →</button>
          </section>

          {/* Top contributors */}
          <section className={styles.sideSection} aria-labelledby="contributors-heading">
            <h2 id="contributors-heading" className={styles.sideTitle}>Top contributors</h2>
            <ul className={styles.memberList}>
              {MEMBERS.map((m, i) => (
                <li key={i} className={styles.memberItem}>
                  <Avatar initials={m.initials} color={m.color} size={32} />
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{m.name}</span>
                    <span className={styles.memberRole}>{m.role}</span>
                  </div>
                  {m.hot && (
                    <span className={styles.hotBadge} aria-label="Hot contributor">🔥</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Quick checker */}
          <section className={styles.sideSection} aria-labelledby="checker-heading">
            <h2 id="checker-heading" className={styles.sideTitle}>Quick WAVE scan</h2>
            <p className={styles.checkerDesc}>Paste any URL for an instant accessibility scan</p>
            <label htmlFor="wave-url" className="sr-only">Website URL</label>
            <input
              id="wave-url"
              className={styles.checkerInput}
              type="url"
              placeholder="https://yoursite.com"
            />
            <button
              className={styles.checkerBtn}
              onClick={() => {
                const url = document.getElementById('wave-url').value;
                if (url) window.open(`https://wave.webaim.org/report#/${url}`, '_blank');
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
