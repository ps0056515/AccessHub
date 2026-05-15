export const STATS = [
  { num: '12,480', label: 'Community members' },
  { num: '3,200+', label: 'Discussion threads' },
  { num: '840', label: 'Resources shared' },
  { num: '94', label: 'Events this year' },
];

export const POSTS = [
  {
    id: 1,
    votes: 47,
    initials: 'RM',
    color: 'blue',
    author: 'Riya Mehta',
    role: 'WCAG Specialist',
    time: '2h ago',
    replies: 12,
    title: 'WCAG 2.2 Target Size (2.5.8) — what counts as "spacing" for AA compliance?',
    excerpt:
      'Struggling with the offset calculation when buttons are inline. The spec says "target offset" but our design system uses margin spacing. Does that count?',
    body:
      'We\'re auditing commerce flows where primary actions sit on the same row. I\'d love concrete examples of when adjacent targets pass 2.5.8 versus when spacing has to come from elsewhere. Are nested controls treated differently?',
    tags: ['WCAG 2.2', 'ARIA'],
    tagColors: ['blue', 'purple'],
  },
  {
    id: 2,
    votes: 31,
    initials: 'JP',
    color: 'green',
    author: 'James Park',
    role: 'AT Tester',
    time: '5h ago',
    replies: 8,
    title: 'Best way to test with NVDA — keyboard shortcuts cheat sheet?',
    excerpt:
      "I've been using VoiceOver on Mac exclusively and now need to cover NVDA on Windows for a client audit. Any go-to resources for beginners?",
    body:
      'Looking for a concise shortcut list and a recommended testing order (browse mode vs focus mode). Tips for pairing NVDA with Chrome vs Firefox welcome.',
    tags: ['Screen readers'],
    tagColors: ['green'],
  },
  {
    id: 3,
    votes: 89,
    initials: 'SL',
    color: 'amber',
    author: 'Sofia Lund',
    role: 'Legal & Policy',
    time: '1d ago',
    replies: 34,
    title:
      'European Accessibility Act June 2025 — is your product ready? Sharing our compliance checklist',
    excerpt:
      "The EAA deadline is here. Sharing our internal compliance checklist — what we fixed, what we're still working on, and what surprised us most.",
    body:
      'We prioritised checkout and account flows first, then marketing pages. Happy to share the spreadsheet template we used with vendors.',
    tags: ['Legal', 'Audit'],
    tagColors: ['amber', 'red'],
  },
  {
    id: 4,
    votes: 22,
    initials: 'AA',
    color: 'pink',
    author: 'Amara Adeyemi',
    role: 'UX Designer',
    time: '1d ago',
    replies: 5,
    title: 'Does APCA replace WCAG contrast ratios? Confused about when to use which',
    excerpt:
      'My design lead insists on APCA for our new DS but our auditors still test against 4.5:1. How do teams navigate this disagreement?',
    body:
      'We need a written policy for new components: when APCA is advisory vs when we fall back to WCAG 1.4.3 for sign-off.',
    tags: ['Color contrast', 'WCAG'],
    tagColors: ['pink', 'blue'],
  },
  {
    id: 5,
    votes: 56,
    initials: 'TK',
    color: 'purple',
    author: 'Tariq Khan',
    role: 'Frontend Dev',
    time: '2d ago',
    replies: 19,
    title: 'Modal dialog focus trap — the right way in 2025 (no jQuery, pure React)',
    excerpt:
      "We keep seeing the inert attribute recommended but browser support is inconsistent. Here's what we ended up with in our React component library.",
    body:
      'Sharing our approach: initial focus, cycle wrap, escape closes, return focus to trigger, and a minimal focus-guard helper.',
    tags: ['ARIA', 'Motor'],
    tagColors: ['purple', 'red'],
  },
  {
    id: 6,
    votes: 18,
    initials: 'LN',
    color: 'green',
    author: 'Lena Novak',
    role: 'Product Manager',
    time: '3d ago',
    replies: 11,
    title: 'How to build the business case for accessibility investment — slides + data',
    excerpt:
      'Sharing the deck I used to get exec buy-in for a full accessibility audit. Includes ROI data, legal risk framing, and user research quotes.',
    body:
      'The section on support-ticket reduction landed best with our COO. I can anonymise our spreadsheet if useful.',
    tags: ['Strategy'],
    tagColors: ['green'],
  },
];

/** Mock reply threads — keyed by post id */
export const THREAD_COMMENTS = {
  1: [
    {
      id: 'c1',
      author: 'Marcus Chen',
      initials: 'MC',
      color: 'green',
      time: '1h ago',
      body: 'We use padding between targets when the spec spacing is ambiguous — document it in your VPAT with screenshots.',
    },
    {
      id: 'c2',
      author: 'Elena Voss',
      initials: 'EV',
      color: 'purple',
      time: '45m ago',
      body: 'Same — also check focus outlines don’t shrink perceived target size when the ring overflows.',
    },
  ],
  2: [
    {
      id: 'c1',
      author: 'Noah Ibrahim',
      initials: 'NI',
      color: 'amber',
      time: '3h ago',
      body: 'Microsoft cheat sheet + inserting browse-mode practice on a sample table first worked for our QA bootcamp.',
    },
  ],
  3: [
    {
      id: 'c1',
      author: 'Priya Singh',
      initials: 'PS',
      color: 'blue',
      time: '12h ago',
      body: 'We paired legal with design leads weekly; biggest gap was third-party widgets — start vendor outreach early.',
    },
    {
      id: 'c2',
      author: 'Jonas Meyer',
      initials: 'JM',
      color: 'green',
      time: '6h ago',
      body: 'Happy to compare checklist rows if you paste a redacted version.',
    },
  ],
};

export function getCommentsForPost(postId) {
  const n = typeof postId === 'string' ? parseInt(postId, 10) : postId;
  const list = THREAD_COMMENTS[n] ?? THREAD_COMMENTS[postId];
  return Array.isArray(list) ? list : [];
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const RESOURCES = [
  {
    slug: 'wcag-22-checklist',
    icon: '📋',
    title: 'WCAG 2.2 checklist',
    desc: 'Printable AA/AAA success criteria reference with implementation notes',
    color: 'blue',
    category: 'Standards',
    viewUrl: 'https://www.w3.org/TR/WCAG22/',
  },
  {
    slug: 'accessibility-statement-template',
    icon: '📄',
    title: 'Accessibility statement template',
    desc: 'EAA-compliant template used by 400+ organisations',
    color: 'green',
    category: 'Legal',
    viewUrl: 'https://www.w3.org/WAI/planning/statements/',
  },
  {
    slug: 'aria-patterns-snippet',
    icon: '🔷',
    title: 'ARIA patterns library',
    desc: 'Code snippets for 30 common UI components with correct ARIA roles',
    color: 'purple',
    category: 'Design',
    viewUrl: 'https://www.w3.org/WAI/ARIA/apg/',
  },
  {
    slug: 'audit-methodology-guide',
    icon: '🔍',
    title: 'Audit methodology guide',
    desc: 'Step-by-step manual and automated testing process',
    color: 'amber',
    category: 'Testing',
    viewUrl: 'https://www.w3.org/WAI/test-evaluate/',
  },
  {
    slug: 'at-testing-environments',
    icon: '🖥️',
    title: 'AT testing environments',
    desc: 'VoiceOver, NVDA, JAWS — setup guides for each platform',
    color: 'red',
    category: 'Testing',
    viewUrl: 'https://webaim.org/articles/screenreader_testing/',
  },
  {
    slug: 'accessible-colour-systems',
    icon: '🎨',
    title: 'Accessible colour systems',
    desc: 'Design token examples with AA-passing contrast built in',
    color: 'pink',
    category: 'Design',
    viewUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
  },
  {
    slug: 'video-tutorial-library',
    icon: '📹',
    title: 'Video tutorial library',
    desc: '60+ hours of recorded workshops from past community events',
    color: 'green',
    category: 'Tools',
    viewUrl: 'https://www.w3.org/WAI/teach-advocate/',
  },
  {
    slug: 'screen-reader-survey',
    icon: '📊',
    title: 'Screen reader survey 2024',
    desc: 'WebAIM annual data on AT usage across 1,400+ respondents',
    color: 'blue',
    category: 'Testing',
    viewUrl: 'https://webaim.org/projects/screenreadersurvey9/',
  },
].map((r) => ({ ...r, slug: r.slug || slugify(r.title) }));

export const TOOLS = [
  { icon: '🌊', name: 'WAVE', type: 'Browser extension', price: 'Free', badge: 'Popular', badgeColor: 'green', url: 'https://wave.webaim.org' },
  { icon: '🪓', name: 'axe DevTools', type: 'Browser extension', price: 'Free / Pro', badge: 'Recommended', badgeColor: 'blue', url: 'https://www.deque.com/axe/devtools/' },
  { icon: '🔬', name: 'Colour Contrast Analyser', type: 'Desktop app', price: 'Free', badge: null, url: 'https://www.tpgi.com/color-contrast-checker/' },
  { icon: '💡', name: 'Lighthouse', type: 'Built-in DevTools', price: 'Free', badge: null, url: 'https://developer.chrome.com/docs/lighthouse/overview/' },
  { icon: '🔎', name: 'Accessibility Insights', type: 'Browser extension', price: 'Free', badge: null, url: 'https://accessibilityinsights.io/' },
  { icon: '✅', name: 'Sa11y', type: 'JS library', price: 'Open source', badge: 'New', badgeColor: 'purple', url: 'https://sa11y.netlify.app/' },
  { icon: '🤖', name: 'axe-core', type: 'JS library / CI', price: 'Open source', badge: null, url: 'https://github.com/dequelabs/axe-core' },
  { icon: '🧪', name: 'NVDA', type: 'Windows screen reader', price: 'Free', badge: null, url: 'https://www.nvaccess.org/download/' },
];

export const CERTS = [
  {
    icon: '🏅',
    color: 'blue',
    title: 'CPACC — Certified Professional in Accessibility Core Competencies',
    body: 'IAAP · Foundation level · Best first certification for anyone entering the field',
    progress: 72,
    members: '4,200+ holders',
    learnMoreUrl: 'https://www.accessibilityassociation.org/certification',
  },
  {
    icon: '🏅',
    color: 'green',
    title: 'WAS — Web Accessibility Specialist',
    body: 'IAAP · Technical depth · Requires hands-on WCAG implementation experience',
    progress: 48,
    members: '2,100+ holders',
    learnMoreUrl: 'https://www.accessibilityassociation.org/certification',
  },
  {
    icon: '🏅',
    color: 'purple',
    title: 'CPABE — Certified Professional in Accessible Built Environments',
    body: 'IAAP · Physical accessibility focus · ADA / IBC expertise required',
    progress: 31,
    members: '780+ holders',
    learnMoreUrl: 'https://www.accessibilityassociation.org/certification',
  },
  {
    icon: '📚',
    color: 'amber',
    title: 'WebAIM training courses',
    body: 'Self-paced · WCAG, screen readers, PDF accessibility, and more',
    progress: 88,
    members: '12,000+ enrolled',
    learnMoreUrl: 'https://webaim.org/training/',
  },
];

/** Unified list: sidebar + events page (ids stable for deep links).
 *  Anchor "today" for copy: mid‑May 2026 — past / live / upcoming are consistent with that. */
export const ALL_EVENTS = [
  /* Past — ended before May 14, 2026 */
  {
    id: 'past-ux-101',
    month: 'JAN',
    day: '14',
    title: 'Intro to inclusive UX research',
    type: 'Online · 60 min · Free',
    band: 'Free',
    timing: 'past',
  },
  {
    id: 'past-audit-panel',
    month: 'FEB',
    day: '6',
    title: 'Auditor roundtable: false positives',
    type: 'Online · 90 min · Free',
    band: 'Free',
    timing: 'past',
  },
  {
    id: 'past-eaa-prep',
    month: 'MAR',
    day: '20',
    title: 'EAA prep workshop recording drop',
    type: 'Online · 120 min · Members only',
    band: 'Members only',
    timing: 'past',
  },
  {
    id: 'past-apr-procurement',
    month: 'APR',
    day: '8',
    title: 'Public-sector accessibility procurement clinic',
    type: 'Online · 90 min · Free',
    band: 'Free',
    timing: 'past',
  },
  {
    id: 'past-viz-may',
    month: 'MAY',
    day: '7',
    title: 'Accessible data viz workshop',
    type: 'Online · 90 min · Free',
    band: 'Free',
    timing: 'past',
  },

  /* Live — May 14, 2026 (happening now) */
  {
    id: 'live-gaad-panel',
    month: 'MAY',
    day: '14',
    title: 'GAAD 2026 — live practitioner panel & audience Q&A',
    type: 'Online · 90 min · Free',
    band: 'Free',
    timing: 'live',
  },

  /* Upcoming — after May 14, 2026 */
  {
    id: 'eaa-qa',
    month: 'MAY',
    day: '15',
    title: 'EAA compliance Q&A live session',
    type: 'Online · 60 min · Free',
    band: 'Free',
    timing: 'upcoming',
  },
  {
    id: 'wcag-debrief',
    month: 'MAY',
    day: '28',
    title: 'WCAG 2.2 debrief — what changed for your roadmap',
    type: 'Online · 75 min · Members only',
    band: 'Members only',
    timing: 'upcoming',
  },
  {
    id: 'csun',
    month: 'JUN',
    day: '3',
    title: 'CSUN ATC 2026 — recap & takeaways for teams',
    type: 'Online · 2h · Members only',
    band: 'Members only',
    timing: 'upcoming',
  },
  {
    id: 'mobile-jun',
    month: 'JUN',
    day: '18',
    title: 'Mobile accessibility deep-dive',
    type: 'Online · 90 min · Free',
    band: 'Free',
    timing: 'upcoming',
  },
  {
    id: 'meetup-london',
    month: 'JUL',
    day: '9',
    title: 'Annual All Can Access community meetup',
    type: 'In-person · London · Members',
    band: 'In-person',
    timing: 'upcoming',
  },
  {
    id: 'cog-jul',
    month: 'JUL',
    day: '22',
    title: 'Designing for cognitive accessibility',
    type: 'Online · 75 min · Free',
    band: 'Free',
    timing: 'upcoming',
  },
  {
    id: 'pdf-aug',
    month: 'AUG',
    day: '5',
    title: 'PDF accessibility deep-dive workshop',
    type: 'Online · 90 min · Free',
    band: 'Free',
    timing: 'upcoming',
  },
  {
    id: 'survey-aug',
    month: 'AUG',
    day: '19',
    title: 'All Can Access annual survey results reveal',
    type: 'Online · 60 min · Free',
    band: 'Free',
    timing: 'upcoming',
  },
  {
    id: 'mobile-sep',
    month: 'SEP',
    day: '11',
    title: 'Inclusive UX patterns for mobile',
    type: 'Online · 90 min · Members only',
    band: 'Members only',
    timing: 'upcoming',
  },
];

export const EVENTS = ALL_EVENTS;

export const MEMBERS = [
  {
    id: 'riya-mehta',
    initials: 'RM',
    name: 'Riya Mehta',
    role: 'WCAG specialist',
    color: 'blue',
    hot: true,
    bio: 'Lead auditor at a European e‑commerce group. Focus areas: complex widgets, WCAG 2.2 targets, and remediation playbooks.',
  },
  {
    id: 'sofia-lund',
    initials: 'SL',
    name: 'Sofia Lund',
    role: 'Legal & policy',
    color: 'green',
    hot: false,
    bio: 'Maps product roadmaps to EAA and national transpositions. Former public-sector procurement adviser.',
  },
  {
    id: 'tariq-khan',
    initials: 'TK',
    name: 'Tariq Khan',
    role: 'Frontend dev',
    color: 'purple',
    hot: false,
    bio: 'Design-systems engineer; ships accessible components in React and documents patterns for partner teams.',
  },
  {
    id: 'amara-adeyemi',
    initials: 'AA',
    name: 'Amara Adeyemi',
    role: 'UX designer',
    color: 'pink',
    hot: false,
    bio: 'Runs inclusive research with disabled participants and pairs with devs for realistic acceptance criteria.',
  },
  {
    id: 'james-park',
    initials: 'JP',
    name: 'James Park',
    role: 'AT tester',
    color: 'amber',
    hot: false,
    bio: 'NVDA / JAWS / VoiceOver coverage on Windows and macOS; trains QA squads on screen reader journeys.',
  },
];

export const TAG_COLORS = {
  'WCAG 2.2': { bg: '#e8f0fb', text: '#0d3060' },
  WCAG: { bg: '#e8f0fb', text: '#0d3060' },
  'Screen readers': { bg: '#e6f4ee', text: '#0d4a32' },
  Audit: { bg: '#fef3e2', text: '#6b3f05' },
  'Color contrast': { bg: '#fdecea', text: '#7a1f12' },
  ARIA: { bg: '#f0edfd', text: '#3a2580' },
  Motor: { bg: '#fdecea', text: '#7a1f12' },
  Legal: { bg: '#f3f2ef', text: '#4a4840' },
  Strategy: { bg: '#e6f4ee', text: '#0d4a32' },
  Pink: { bg: '#fde8f0', text: '#7a2050' },
};

export const COLOR_MAP = {
  blue: { bg: '#e8f0fb', text: '#0d3060' },
  green: { bg: '#e6f4ee', text: '#0d4a32' },
  amber: { bg: '#fef3e2', text: '#6b3f05' },
  purple: { bg: '#f0edfd', text: '#3a2580' },
  red: { bg: '#fdecea', text: '#7a1f12' },
  pink: { bg: '#fde8f0', text: '#7a2050' },
};
