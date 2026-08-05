import { useEffect, useState, useCallback, useRef } from 'react';
import { jobsApi } from 'api/client';
import Container from 'components/common/Container/Container';
import SEO from 'components/common/SEO/SEO';
import styles from './AccessibilityJobs.module.css';

const QUICK_TAGS = ['WCAG', 'Screen Readers', 'ADA', 'ARIA', 'A11y', 'PDF Accessibility'];

function formatDate(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getTypeClass(type) {
  if (!type) return '';
  const t = type.toLowerCase();
  if (t.includes('remote')) return styles.badgeRemote;
  if (t.includes('hybrid')) return styles.badgeHybrid;
  if (t.includes('contract')) return styles.badgeContract;
  return styles.badgeOnsite;
}

const SUGGESTED_ROLES = [
  "Accessibility Tester", "Accessibility QA Engineer", "Accessibility Test Engineer",
  "Accessibility Analyst", "Accessibility Consultant", "Digital Accessibility Specialist",
  "Accessibility Compliance Tester", "Accessibility Auditor", "Accessibility Validation Engineer",
  "Accessibility Engineer", "WCAG Tester", "Section 508 Tester", "ADA Compliance Tester",
  "Accessibility Specialist", "Inclusive Design Tester", "QA Engineer Accessibility",
  "Software Test Engineer Accessibility", "Mobile Accessibility Tester", "Accessibility Automation Tester",
  "Accessibility Quality Analyst", "Accessibility Quality Engineer", "Manual Tester Accessibility",
  "Accessibility Verification Engineer", "iOS Accessibility Tester", "Android Accessibility Tester",
  "Mobile QA Accessibility Engineer", "VoiceOver Tester", "TalkBack Tester",
  "Mobile Accessibility Specialist", "WCAG 2.1", "WCAG 2.2", "Digital Accessibility",
  "NVDA", "JAWS", "Axe DevTools", "Accessibility Validation", "Screen Reader Testing"
];

const SUGGESTED_LOCATIONS = [
  "India", "United States", "United Kingdom", "Canada", "Australia", 
  "Europe", "Germany", "France", "Netherlands", "Ireland", "Spain",
  "Singapore", "New Zealand", "South Africa", "Brazil", "Japan", "Remote"
];

function AccessibleCombobox({ id, label, placeholder, value, onChange, options, icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listboxId = `${id}-listbox`;

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      const activeEl = document.getElementById(`${listboxId}-option-${activeIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, isOpen, listboxId]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      if (filteredOptions.length === 0) return;
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(0);
      } else {
        setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      if (filteredOptions.length === 0) return;
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(filteredOptions.length - 1);
      } else {
        setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && activeIndex < filteredOptions.length) {
        e.preventDefault(); // Prevent form submission
        onChange(filteredOptions[activeIndex]);
        setIsOpen(false);
        setActiveIndex(-1);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Home') {
      if (isOpen && filteredOptions.length > 0) {
        e.preventDefault();
        setActiveIndex(0);
      }
    } else if (e.key === 'End') {
      if (isOpen && filteredOptions.length > 0) {
        e.preventDefault();
        setActiveIndex(filteredOptions.length - 1);
      }
    } else if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.altKey && e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleBlur = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.relatedTarget)) {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className={styles.inputGroup} ref={wrapperRef} onBlur={handleBlur}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className={styles.comboboxIconWrap} aria-hidden="true">
        {icon}
      </div>
      <input
        id={id}
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onClick={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen && filteredOptions.length > 0}
        aria-controls={isOpen && filteredOptions.length > 0 ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={isOpen && filteredOptions.length > 0 && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul
          id={listboxId}
          className={styles.comboboxListbox}
          role="listbox"
          aria-label={label}
        >
          {filteredOptions.map((option, index) => {
            const isSelected = index === activeIndex;
            return (
              <li
                key={option}
                id={`${listboxId}-option-${index}`}
                className={`${styles.comboboxOption} ${isSelected ? styles.comboboxOptionSelected : ''}`}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                }}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                  setActiveIndex(-1);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {option}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function AccessibilityJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  
  // Real API parameters (what is actually being fetched)
  const [fetchParams, setFetchParams] = useState({ query: 'accessibility', location: '', remote_jobs_only: false });

  const fetchJobs = useCallback(async (params) => {
    setLoading(true);
    setError('');
    try {
      const data = await jobsApi.list(params);
      setJobs(data || []);
    } catch (err) {
      setError(err?.message || 'Could not load jobs at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchParams) {
      fetchJobs(fetchParams);
    }
  }, [fetchParams, fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    setLoading(true);
    
    setFetchParams({
      query: searchQuery.trim() || 'accessibility',
      location: locationQuery.trim(),
      remote_jobs_only: remoteOnly
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setRemoteOnly(false);
    // Don't set hasSearched to false, just fetch global jobs again
    setFetchParams({ query: 'accessibility', location: '', remote_jobs_only: false });
  };

  const handleShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=600');
  };

  return (
    <Container>
      <SEO 
        title="Accessibility Jobs | AllCanAccess"
        description="Launch your career in digital inclusion. Find remote accessibility jobs, WCAG testing roles, inclusive design positions, and compliance expert opportunities at top global organizations prioritizing digital accessibility."
        keywords="accessibility jobs, a11y careers, digital accessibility roles, WCAG testing jobs, inclusive design jobs, accessibility engineer, ADA compliance jobs, Section 508 jobs, accessibility specialist, accessibility consultant, accessibility QA tester, remote accessibility jobs, web accessibility developer, IAAP jobs, CPACC jobs, WAS jobs, accessibility manager, inclusive UX researcher, digital inclusion careers, accessibility analyst, PDF accessibility jobs, accessibility product manager, accessibility auditor, assistive technology specialist, a11y employment, accessible tech careers"
      />
      <div className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroBadge}>
            <span aria-hidden="true">💼</span> Career Opportunities
          </div>
          <h1 className={styles.heroTitle}>Accessibility Jobs</h1>
          <p className={styles.heroSubtitle}>
            Real-time accessibility roles from top companies worldwide. Find your next role in digital inclusion.
          </p>
          <div className={styles.heroActions}>
            <button type="button" onClick={handleShare} className={styles.shareBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              Share on LinkedIn
            </button>
          </div>
        </header>

        <form className={styles.searchForm} onSubmit={handleSearch} aria-label="Search jobs">
          <div className={styles.searchRow}>
            <AccessibleCombobox
              id="search-query"
              label="Job title or keywords"
              placeholder="Job title, keywords, or company..."
              value={searchQuery}
              onChange={setSearchQuery}
              options={SUGGESTED_ROLES}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            />

            <AccessibleCombobox
              id="search-location"
              label="Location"
              placeholder="e.g. India, Remote, New York..."
              value={locationQuery}
              onChange={setLocationQuery}
              options={SUGGESTED_LOCATIONS}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              }
            />

            <button 
              type="submit" 
              className={styles.searchBtn}
            >
              Search
            </button>
          </div>

          <div className={styles.filtersRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={e => {
                  setRemoteOnly(e.target.checked);
                }}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Remote jobs only</span>
            </label>
          </div>
        </form>

        <div className={styles.statsStrip} aria-live="polite">
          <span className={styles.statChip}>
            {loading ? 'Searching...' : `${jobs.length} ${jobs.length === 1 ? 'role' : 'roles'} found`}
          </span>
          {(searchQuery || locationQuery || remoteOnly) && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          )}
        </div>

        <div aria-live="polite" aria-atomic="true">
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} aria-hidden="true"></div>
              <p>Loading real-time jobs...</p>
            </div>
          )}
        </div>

        {error && (
          <div className={styles.errorState} role="alert">
            <span className={styles.errorIcon} aria-hidden="true">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden="true">🔍</span>
            <p className={styles.emptyText}>
              No jobs match your criteria. Try adjusting your search or clearing filters.
            </p>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <ul className={styles.jobList} aria-label="Job listings">
            {jobs.map(job => (
              <li key={job.id} className={styles.jobCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderLeft}>
                    <h2 className={styles.jobTitle}>{job.title}</h2>
                    <p className={styles.jobCompany}>
                      {job.company}
                      {job.location && (
                        <span className={styles.jobLocation}>
                          <span aria-hidden="true">📍</span> {job.location}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className={styles.cardBadges}>
                    {job.is_remote && (
                      <span className={`${styles.badge} ${styles.badgeRemote}`}>
                        Remote
                      </span>
                    )}
                    {job.job_type && (
                      <span className={`${styles.badge} ${getTypeClass(job.job_type)}`}>
                        {job.job_type.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>

                {job.description && (
                  <p className={styles.jobDesc}>{job.description}</p>
                )}

                <div className={styles.cardFooter}>
                  <ul className={styles.tagList} aria-label={`Skills: ${job.tags ? job.tags.join(', ') : 'Not specified'}`}>
                    {(job.tags || []).map(tag => (
                      <li key={tag} className={styles.tag}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <div className={styles.cardActions}>
                    {job.posted_date && (
                      <span className={styles.postedDate}>
                        Posted {formatDate(job.posted_date)}
                      </span>
                    )}
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.applyBtn}
                      aria-label={`Apply for ${job.title} at ${job.company || 'this company'} (opens in new window)`}
                    >
                      {job.company ? `Apply at ${job.company}` : 'Apply Now'} <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <footer className={styles.updateNotice}>
          <p>
            <span aria-hidden="true">⚡</span>{' '}
            Real-time job listings aggregated from LinkedIn, Indeed, Glassdoor, and company career pages.
          </p>
        </footer>
      </div>
    </Container>
  );
}
