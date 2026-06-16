/**
 * sync-jobs.js
 *
 * Fetches accessibility-related jobs from free public APIs
 * and upserts them into the accessibility_jobs table.
 *
 * Run manually:   node server/scripts/sync-jobs.js
 * Via npm:        npm run sync-jobs
 *
 * Cron (1st of every month at 03:00):
 *   0 3 1 * * cd /path/to/AccessHub && node server/scripts/sync-jobs.js >> /var/log/sync-jobs.log 2>&1
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { query, closePool } = require('../db');

// Keywords we search for across every API
const KEYWORDS = [
  'accessibility',
  'accessible',
  'wcag',
  'a11y',
  'inclusive design',
  'screen reader',
  'assistive technology',
];

// ─── Helpers ───────────────────────────────────────────
function matchesA11y(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return KEYWORDS.some(kw => lower.includes(kw));
}

function trimTo(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

// ─── Source 1: Remotive (free, no auth) ────────────────
async function fetchRemotive() {
  const jobs = [];
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=100');
    if (!res.ok) throw new Error(`Remotive ${res.status}`);
    const data = await res.json();
    for (const j of data.jobs || []) {
      const combined = `${j.title} ${j.description} ${j.tags?.join(' ') || ''}`;
      if (!matchesA11y(combined)) continue;
      jobs.push({
        title: trimTo(j.title, 500),
        company: trimTo(j.company_name, 300),
        location: trimTo(j.candidate_required_location || 'Remote', 300),
        job_type: j.job_type || 'Full-time',
        url: j.url,
        source: 'Remotive',
        posted_date: j.publication_date ? new Date(j.publication_date) : new Date(),
        description: trimTo(j.description?.replace(/<[^>]*>/g, ''), 500),
        tags: (j.tags || []).join(', '),
      });
    }
    console.log(`  Remotive: found ${jobs.length} accessibility jobs`);
  } catch (err) {
    console.warn('  Remotive fetch failed:', err.message);
  }
  return jobs;
}

// ─── Source 2: Arbeitnow (free, no auth) ───────────────
async function fetchArbeitnow() {
  const jobs = [];
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (!res.ok) throw new Error(`Arbeitnow ${res.status}`);
    const data = await res.json();
    for (const j of data.data || []) {
      const combined = `${j.title} ${j.description} ${j.tags?.join(' ') || ''}`;
      if (!matchesA11y(combined)) continue;
      jobs.push({
        title: trimTo(j.title, 500),
        company: trimTo(j.company_name, 300),
        location: trimTo(j.location || 'Remote', 300),
        job_type: j.remote ? 'Remote' : 'On-site',
        url: j.url,
        source: 'Arbeitnow',
        posted_date: j.created_at ? new Date(j.created_at * 1000) : new Date(),
        description: trimTo(j.description?.replace(/<[^>]*>/g, ''), 500),
        tags: (j.tags || []).join(', '),
      });
    }
    console.log(`  Arbeitnow: found ${jobs.length} accessibility jobs`);
  } catch (err) {
    console.warn('  Arbeitnow fetch failed:', err.message);
  }
  return jobs;
}

// ─── Fallback: curated seed jobs ───────────────────────
function getSeedJobs() {
  const now = new Date();
  return [
    {
      title: 'Senior Accessibility Engineer',
      company: 'Microsoft',
      location: 'Remote – Global',
      job_type: 'Full-time',
      url: 'https://www.linkedin.com/jobs/search/?keywords=accessibility+engineer&f_C=1035',
      source: 'LinkedIn',
      posted_date: now,
      description: 'Design, build, and maintain accessible web experiences that meet WCAG 2.2 AA standards across Microsoft 365 products.',
      tags: 'WCAG, ARIA, React, Screen Readers',
    },
    {
      title: 'Digital Accessibility Analyst',
      company: 'Deloitte',
      location: 'Hyderabad, India',
      job_type: 'Full-time',
      url: 'https://www.naukri.com/accessibility-jobs',
      source: 'Naukri',
      posted_date: now,
      description: 'Conduct accessibility audits using JAWS, NVDA, and VoiceOver. Report WCAG conformance issues and provide remediation guidance.',
      tags: 'Audit, WCAG, JAWS, NVDA',
    },
    {
      title: 'Inclusive Design Lead',
      company: 'Google',
      location: 'Bangalore, India (Hybrid)',
      job_type: 'Full-time',
      url: 'https://www.linkedin.com/jobs/search/?keywords=inclusive+design&f_C=1441',
      source: 'LinkedIn',
      posted_date: now,
      description: 'Lead inclusive design practices across Google Cloud products, partnering with engineering and UX teams to ensure WCAG 2.2 AA conformance.',
      tags: 'Inclusive Design, UX, WCAG',
    },
    {
      title: 'Accessibility QA Tester',
      company: 'Accenture',
      location: 'Pune, India',
      job_type: 'Full-time',
      url: 'https://www.naukri.com/accessibility-testing-jobs',
      source: 'Naukri',
      posted_date: now,
      description: 'Test web and mobile apps for accessibility with assistive technologies. Create detailed bug reports with WCAG success criteria references.',
      tags: 'QA, Testing, NVDA, TalkBack',
    },
    {
      title: 'WCAG Compliance Specialist',
      company: 'IBM',
      location: 'Remote – USA',
      job_type: 'Full-time',
      url: 'https://www.linkedin.com/jobs/search/?keywords=wcag+compliance&f_C=1009',
      source: 'LinkedIn',
      posted_date: now,
      description: 'Ensure IBM products meet Section 508 and WCAG 2.2 standards. Collaborate with development teams on accessible design patterns.',
      tags: 'WCAG, Section 508, Compliance',
    },
    {
      title: 'Accessibility Consultant',
      company: 'Wipro',
      location: 'Mumbai, India (Hybrid)',
      job_type: 'Full-time',
      url: 'https://www.naukri.com/accessibility-consultant-jobs',
      source: 'Naukri',
      posted_date: now,
      description: 'Advise enterprise clients on digital accessibility strategy, VPAT documentation, and WCAG remediation roadmaps.',
      tags: 'Consulting, VPAT, Strategy',
    },
    {
      title: 'Frontend Developer – Accessibility Focus',
      company: 'Shopify',
      location: 'Remote – Worldwide',
      job_type: 'Full-time',
      url: 'https://www.linkedin.com/jobs/search/?keywords=frontend+accessibility&f_C=1937',
      source: 'LinkedIn',
      posted_date: now,
      description: 'Build accessible, performant UI components in React with full ARIA support. Champion accessibility across the Shopify design system.',
      tags: 'React, ARIA, Design Systems, A11y',
    },
    {
      title: 'Accessibility Program Manager',
      company: 'Amazon',
      location: 'Seattle, WA (Hybrid)',
      job_type: 'Full-time',
      url: 'https://www.linkedin.com/jobs/search/?keywords=accessibility+program+manager&f_C=1586',
      source: 'LinkedIn',
      posted_date: now,
      description: 'Drive Amazon\'s accessibility program across retail and devices. Coordinate cross-team a11y testing and training initiatives.',
      tags: 'Program Management, A11y Strategy',
    },
    {
      title: 'UX Researcher – Assistive Technology',
      company: 'Apple',
      location: 'Cupertino, CA',
      job_type: 'Full-time',
      url: 'https://www.linkedin.com/jobs/search/?keywords=assistive+technology+researcher&f_C=162479',
      source: 'LinkedIn',
      posted_date: now,
      description: 'Conduct user research with people who use assistive technologies. Inform VoiceOver, Switch Control, and accessibility feature design.',
      tags: 'UX Research, VoiceOver, Assistive Tech',
    },
    {
      title: 'Accessibility Trainer & Evangelist',
      company: 'TCS',
      location: 'Chennai, India',
      job_type: 'Full-time',
      url: 'https://www.naukri.com/accessibility-trainer-jobs',
      source: 'Naukri',
      posted_date: now,
      description: 'Develop and deliver accessibility training programs for 500+ developers. Create WCAG compliance workshops and certification prep courses.',
      tags: 'Training, WCAG, CPACC, WAS',
    },
    {
      title: 'PDF Accessibility Remediation Specialist',
      company: 'Infosys',
      location: 'Remote – India',
      job_type: 'Contract',
      url: 'https://www.naukri.com/pdf-accessibility-jobs',
      source: 'Naukri',
      posted_date: now,
      description: 'Remediate PDF, Word, and PowerPoint documents to meet WCAG 2.2 AA and PDF/UA standards using Adobe Acrobat Pro and CommonLook.',
      tags: 'PDF, Document Accessibility, PDF/UA',
    },
    {
      title: 'Mobile Accessibility Engineer (iOS/Android)',
      company: 'Meta',
      location: 'London, UK (Hybrid)',
      job_type: 'Full-time',
      url: 'https://www.linkedin.com/jobs/search/?keywords=mobile+accessibility+engineer',
      source: 'LinkedIn',
      posted_date: now,
      description: 'Build accessible mobile experiences for Facebook and Instagram. Implement VoiceOver and TalkBack support in native iOS and Android apps.',
      tags: 'iOS, Android, VoiceOver, TalkBack',
    },
  ];
}

// ─── Main sync logic ───────────────────────────────────
async function syncJobs() {
  console.log('🔄 Starting accessibility jobs sync...');
  console.log(`  Timestamp: ${new Date().toISOString()}`);

  // Fetch from all sources
  const [remotiveJobs, arbeitnowJobs] = await Promise.all([
    fetchRemotive(),
    fetchArbeitnow(),
  ]);

  let allJobs = [...remotiveJobs, ...arbeitnowJobs];

  // If APIs returned fewer than 5 jobs, supplement with curated seed data
  if (allJobs.length < 5) {
    console.log('  APIs returned few results — adding curated seed jobs');
    allJobs = [...allJobs, ...getSeedJobs()];
  }

  // Deduplicate by URL
  const seen = new Set();
  const uniqueJobs = allJobs.filter(j => {
    if (seen.has(j.url)) return false;
    seen.add(j.url);
    return true;
  });

  console.log(`  Total unique jobs to insert: ${uniqueJobs.length}`);

  // Clear old jobs and insert new ones inside a transaction
  const client = (await require('../db').pool.connect());
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM accessibility_jobs');

    for (const j of uniqueJobs) {
      await client.query(
        `INSERT INTO accessibility_jobs
           (title, company, location, job_type, url, source, posted_date, description, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [j.title, j.company, j.location, j.job_type, j.url, j.source, j.posted_date, j.description, j.tags]
      );
    }

    await client.query('COMMIT');
    console.log(`✅ Synced ${uniqueJobs.length} accessibility jobs successfully.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Sync failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await closePool();
  }
}

syncJobs();
