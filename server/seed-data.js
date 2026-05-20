/** Seed content for empty database — mirrors src/data.js discussion threads */
module.exports = {
  POSTS: [
    {
      id: 1,
      votes: 47,
      initials: 'RM',
      color: 'blue',
      author: 'Riya Mehta',
      role: 'WCAG Specialist',
      title: 'WCAG 2.2 Target Size (2.5.8) — what counts as "spacing" for AA compliance?',
      excerpt:
        'Struggling with the offset calculation when buttons are inline. The spec says "target offset" but our design system uses margin spacing. Does that count?',
      body:
        "We're auditing commerce flows where primary actions sit on the same row. I'd love concrete examples of when adjacent targets pass 2.5.8 versus when spacing has to come from elsewhere. Are nested controls treated differently?",
      tags: ['WCAG 2.2', 'ARIA'],
    },
    {
      id: 2,
      votes: 31,
      initials: 'JP',
      color: 'green',
      author: 'James Park',
      role: 'AT Tester',
      title: 'Best way to test with NVDA — keyboard shortcuts cheat sheet?',
      excerpt:
        "I've been using VoiceOver on Mac exclusively and now need to cover NVDA on Windows for a client audit. Any go-to resources for beginners?",
      body:
        'Looking for a concise shortcut list and a recommended testing order (browse mode vs focus mode). Tips for pairing NVDA with Chrome vs Firefox welcome.',
      tags: ['Screen readers'],
    },
    {
      id: 3,
      votes: 89,
      initials: 'SL',
      color: 'amber',
      author: 'Sofia Lund',
      role: 'Legal & Policy',
      title:
        'European Accessibility Act June 2025 — is your product ready? Sharing our compliance checklist',
      excerpt:
        "The EAA deadline is here. Sharing our internal compliance checklist — what we fixed, what we're still working on, and what surprised us most.",
      body:
        'We prioritised checkout and account flows first, then marketing pages. Happy to share the spreadsheet template we used with vendors.',
      tags: ['Legal', 'Audit'],
    },
    {
      id: 4,
      votes: 22,
      initials: 'AA',
      color: 'pink',
      author: 'Amara Adeyemi',
      role: 'UX Designer',
      title: 'Does APCA replace WCAG contrast ratios? Confused about when to use which',
      excerpt:
        'My design lead insists on APCA for our new DS but our auditors still test against 4.5:1. How do teams navigate this disagreement?',
      body:
        'We need a written policy for new components: when APCA is advisory vs when we fall back to WCAG 1.4.3 for sign-off.',
      tags: ['Color contrast', 'WCAG'],
    },
    {
      id: 5,
      votes: 56,
      initials: 'TW',
      color: 'purple',
      author: 'Tomasz Wójcik',
      role: 'Engineer',
      title: 'Accessible drag-and-drop — any patterns that actually work with keyboard + SR?',
      excerpt:
        'Building a kanban board and every DnD library fails basic keyboard support. What have you shipped that passed audit?',
      body:
        'We tried move-up/move-down buttons as fallback but PM wants direct manipulation. Looking for libraries or custom patterns with real-world examples.',
      tags: ['ARIA', 'Engineering'],
    },
    {
      id: 6,
      votes: 38,
      initials: 'LK',
      color: 'green',
      author: 'Lena Kowalski',
      role: 'Product Manager',
      title: 'How do you quantify accessibility ROI for leadership?',
      excerpt:
        'Need to justify headcount for a dedicated a11y role. What metrics resonate beyond compliance risk?',
      body:
        'The section on support-ticket reduction landed best with our COO. I can anonymise our spreadsheet if useful.',
      tags: ['Strategy'],
    },
  ],
  THREAD_COMMENTS: {
    1: [
      {
        author: 'Marcus Chen',
        initials: 'MC',
        color: 'green',
        body: 'We use padding between targets when the spec spacing is ambiguous — document it in your VPAT with screenshots.',
      },
      {
        author: 'Elena Voss',
        initials: 'EV',
        color: 'purple',
        body: 'Same — also check focus outlines don’t shrink perceived target size when the ring overflows.',
      },
    ],
    2: [
      {
        author: 'Noah Ibrahim',
        initials: 'NI',
        color: 'amber',
        body: 'Microsoft cheat sheet + inserting browse-mode practice on a sample table first worked for our QA bootcamp.',
      },
    ],
    3: [
      {
        author: 'Priya Singh',
        initials: 'PS',
        color: 'blue',
        body: 'We paired legal with design leads weekly; biggest gap was third-party widgets — start vendor outreach early.',
      },
      {
        author: 'Jonas Meyer',
        initials: 'JM',
        color: 'green',
        body: 'Happy to compare checklist rows if you paste a redacted version.',
      },
    ],
  },
};
