export const STATS = [
  { num: '12,480', label: 'Community members' },
  { num: '3,200+', label: 'Discussion threads' },
  { num: '840',    label: 'Resources shared' },
  { num: '94',     label: 'Events this year' },
];

export const POSTS = [
  {
    id: 1, votes: 47, initials: 'RM', color: 'blue',
    author: 'Riya Mehta', role: 'WCAG Specialist', time: '2h ago', replies: 12,
    title: 'WCAG 2.2 Target Size (2.5.8) — what counts as "spacing" for AA compliance?',
    excerpt: 'Struggling with the offset calculation when buttons are inline. The spec says "target offset" but our design system uses margin spacing. Does that count?',
    tags: ['WCAG 2.2', 'ARIA'],
    tagColors: ['blue', 'purple'],
  },
  {
    id: 2, votes: 31, initials: 'JP', color: 'green',
    author: 'James Park', role: 'AT Tester', time: '5h ago', replies: 8,
    title: 'Best way to test with NVDA — keyboard shortcuts cheat sheet?',
    excerpt: 'I\'ve been using VoiceOver on Mac exclusively and now need to cover NVDA on Windows for a client audit. Any go-to resources for beginners?',
    tags: ['Screen readers'],
    tagColors: ['green'],
  },
  {
    id: 3, votes: 89, initials: 'SL', color: 'amber',
    author: 'Sofia Lund', role: 'Legal & Policy', time: '1d ago', replies: 34,
    title: 'European Accessibility Act June 2025 — is your product ready? Sharing our compliance checklist',
    excerpt: 'The EAA deadline is here. Sharing our internal compliance checklist — what we fixed, what we\'re still working on, and what surprised us most.',
    tags: ['Legal', 'Audit'],
    tagColors: ['amber', 'red'],
  },
  {
    id: 4, votes: 22, initials: 'AA', color: 'pink',
    author: 'Amara Adeyemi', role: 'UX Designer', time: '1d ago', replies: 5,
    title: 'Does APCA replace WCAG contrast ratios? Confused about when to use which',
    excerpt: 'My design lead insists on APCA for our new DS but our auditors still test against 4.5:1. How do teams navigate this disagreement?',
    tags: ['Color contrast', 'WCAG'],
    tagColors: ['pink', 'blue'],
  },
  {
    id: 5, votes: 56, initials: 'TK', color: 'purple',
    author: 'Tariq Khan', role: 'Frontend Dev', time: '2d ago', replies: 19,
    title: 'Modal dialog focus trap — the right way in 2025 (no jQuery, pure React)',
    excerpt: 'We keep seeing the inert attribute recommended but browser support is inconsistent. Here\'s what we ended up with in our React component library.',
    tags: ['ARIA', 'Motor'],
    tagColors: ['purple', 'red'],
  },
  {
    id: 6, votes: 18, initials: 'LN', color: 'green',
    author: 'Lena Novak', role: 'Product Manager', time: '3d ago', replies: 11,
    title: 'How to build the business case for accessibility investment — slides + data',
    excerpt: 'Sharing the deck I used to get exec buy-in for a full accessibility audit. Includes ROI data, legal risk framing, and user research quotes.',
    tags: ['Strategy'],
    tagColors: ['green'],
  },
];

export const RESOURCES = [
  { icon: '📋', title: 'WCAG 2.2 checklist', desc: 'Printable AA/AAA success criteria reference with implementation notes', color: 'blue' },
  { icon: '📄', title: 'Accessibility statement template', desc: 'EAA-compliant template used by 400+ organisations', color: 'green' },
  { icon: '🔷', title: 'ARIA patterns library', desc: 'Code snippets for 30 common UI components with correct ARIA roles', color: 'purple' },
  { icon: '🔍', title: 'Audit methodology guide', desc: 'Step-by-step manual and automated testing process', color: 'amber' },
  { icon: '🖥️', title: 'AT testing environments', desc: 'VoiceOver, NVDA, JAWS — setup guides for each platform', color: 'red' },
  { icon: '🎨', title: 'Accessible colour systems', desc: 'Design token examples with AA-passing contrast built in', color: 'pink' },
  { icon: '📹', title: 'Video tutorial library', desc: '60+ hours of recorded workshops from past community events', color: 'green' },
  { icon: '📊', title: 'Screen reader survey 2024', desc: 'WebAIM annual data on AT usage across 1,400+ respondents', color: 'blue' },
];

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
    icon: '🏅', color: 'blue',
    title: 'CPACC — Certified Professional in Accessibility Core Competencies',
    body: 'IAAP · Foundation level · Best first certification for anyone entering the field',
    progress: 72,
    members: '4,200+ holders',
  },
  {
    icon: '🏅', color: 'green',
    title: 'WAS — Web Accessibility Specialist',
    body: 'IAAP · Technical depth · Requires hands-on WCAG implementation experience',
    progress: 48,
    members: '2,100+ holders',
  },
  {
    icon: '🏅', color: 'purple',
    title: 'CPABE — Certified Professional in Accessible Built Environments',
    body: 'IAAP · Physical accessibility focus · ADA / IBC expertise required',
    progress: 31,
    members: '780+ holders',
  },
  {
    icon: '📚', color: 'amber',
    title: 'WebAIM training courses',
    body: 'Self-paced · WCAG, screen readers, PDF accessibility, and more',
    progress: 88,
    members: '12,000+ enrolled',
  },
];

export const EVENTS = [
  { month: 'MAY', day: '7',  title: 'Accessible data viz workshop', type: 'Online · 90 min · Free' },
  { month: 'MAY', day: '15', title: 'EAA compliance Q&A live session', type: 'Online · 60 min · Free' },
  { month: 'JUN', day: '3',  title: 'CSUN 2025 recap & highlights', type: 'Online · 2h · Members only' },
  { month: 'JUN', day: '18', title: 'Mobile accessibility deep-dive', type: 'Online · 90 min · Free' },
  { month: 'JUL', day: '9',  title: 'Annual AccessHub community meetup', type: 'In-person · London · Members' },
];

export const MEMBERS = [
  { initials: 'RM', name: 'Riya Mehta',    role: 'WCAG specialist',  color: 'blue',   hot: true },
  { initials: 'SL', name: 'Sofia Lund',    role: 'Legal & policy',   color: 'green',  hot: false },
  { initials: 'TK', name: 'Tariq Khan',    role: 'Frontend dev',     color: 'purple', hot: false },
  { initials: 'AA', name: 'Amara Adeyemi', role: 'UX designer',      color: 'pink',   hot: false },
  { initials: 'JP', name: 'James Park',    role: 'AT tester',        color: 'amber',  hot: false },
];

export const TAG_COLORS = {
  'WCAG 2.2':      { bg: '#e8f0fb', text: '#0d3060' },
  'WCAG':          { bg: '#e8f0fb', text: '#0d3060' },
  'Screen readers':{ bg: '#e6f4ee', text: '#0d4a32' },
  'Audit':         { bg: '#fef3e2', text: '#6b3f05' },
  'Color contrast':{ bg: '#fdecea', text: '#7a1f12' },
  'ARIA':          { bg: '#f0edfd', text: '#3a2580' },
  'Motor':         { bg: '#fdecea', text: '#7a1f12' },
  'Legal':         { bg: '#f3f2ef', text: '#4a4840' },
  'Strategy':      { bg: '#e6f4ee', text: '#0d4a32' },
  'Pink':          { bg: '#fde8f0', text: '#7a2050' },
};

export const COLOR_MAP = {
  blue:   { bg: '#e8f0fb', text: '#0d3060' },
  green:  { bg: '#e6f4ee', text: '#0d4a32' },
  amber:  { bg: '#fef3e2', text: '#6b3f05' },
  purple: { bg: '#f0edfd', text: '#3a2580' },
  red:    { bg: '#fdecea', text: '#7a1f12' },
  pink:   { bg: '#fde8f0', text: '#7a2050' },
};
