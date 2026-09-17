/**
 * Base Provider — Shared contract, normalization, and utilities for all job providers.
 * 
 * Every provider must return jobs matching the normalizedJob schema.
 * No provider-specific response formats should leak outside the provider layer.
 */

const ACCESSIBILITY_KEYWORDS = [
  'accessibil', 'wcag', 'a11y', 'ada ', 'section 508', '508 compliance',
  'screen reader', 'assistive technology', 'inclusive design',
  'vpat', 'jaws', 'nvda', 'voiceover', 'digital accessibility',
  'web accessibility', 'accessibility tester', 'accessibility consultant',
  'accessibility engineer', 'accessibility specialist', 'w3c', 'aria',
  'inclusive digital', 'keyboard navigation', 'pdf remediation'
];

// Map common location names / country names to country codes
const COUNTRY_MAP = {
  // Americas
  'us': 'us', 'usa': 'us', 'united states': 'us', 'america': 'us',
  'canada': 'ca', 'ca': 'ca',
  'brazil': 'br', 'brasil': 'br', 'br': 'br',
  'mexico': 'mx', 'mx': 'mx',
  'argentina': 'ar', 'ar': 'ar',

  // Europe
  'uk': 'gb', 'gb': 'gb', 'united kingdom': 'gb', 'england': 'gb', 'britain': 'gb',
  'germany': 'de', 'de': 'de', 'deutschland': 'de',
  'france': 'fr', 'fr': 'fr',
  'spain': 'es', 'es': 'es',
  'italy': 'it', 'it': 'it',
  'netherlands': 'nl', 'nl': 'nl', 'holland': 'nl',
  'sweden': 'se', 'se': 'se',
  'norway': 'no', 'no': 'no',
  'denmark': 'dk', 'dk': 'dk',
  'finland': 'fi', 'fi': 'fi',
  'switzerland': 'ch', 'ch': 'ch',
  'austria': 'at', 'at': 'at',
  'belgium': 'be', 'be': 'be',
  'portugal': 'pt', 'pt': 'pt',
  'poland': 'pl', 'pl': 'pl',
  'ireland': 'ie', 'ie': 'ie',

  // Asia
  'india': 'in', 'in': 'in',
  'singapore': 'sg', 'sg': 'sg',
  'australia': 'au', 'au': 'au',
  'new zealand': 'nz', 'nz': 'nz',
  'japan': 'jp', 'jp': 'jp',
  'south korea': 'kr', 'korea': 'kr', 'kr': 'kr',
  'china': 'cn', 'cn': 'cn',
  'hong kong': 'hk', 'hk': 'hk',
  'uae': 'ae', 'dubai': 'ae', 'united arab emirates': 'ae', 'ae': 'ae',
  'israel': 'il', 'il': 'il',
  'malaysia': 'my', 'my': 'my',
  'philippines': 'ph', 'ph': 'ph',

  // Africa
  'south africa': 'za', 'za': 'za',
  'nigeria': 'ng', 'ng': 'ng',
  'kenya': 'ke', 'ke': 'ke',
};

/**
 * Detect country code from a free-text location string.
 * Returns 'us' as default if no match found.
 */
function detectCountryCode(location) {
  if (!location) return 'us';
  const lower = location.toLowerCase().trim();

  // Check if the location directly matches a country name/code
  if (COUNTRY_MAP[lower]) return COUNTRY_MAP[lower];

  // Check if any country name appears anywhere in the location string
  for (const [key, code] of Object.entries(COUNTRY_MAP)) {
    if (lower.includes(key)) return code;
  }

  return 'us';
}

const TAG_RULES = [
  { keywords: ['wcag', 'web content accessibility', 'web accessibility'], tag: 'WCAG' },
  { keywords: ['screen reader', 'nvda', 'jaws', 'voiceover', 'talkback'], tag: 'Screen Readers' },
  { keywords: ['ada', 'americans with disabilities'], tag: 'ADA' },
  { keywords: ['aria', 'wai-aria'], tag: 'ARIA' },
  { keywords: ['pdf accessibility', 'pdf remediation', 'pdf/ua'], tag: 'PDF Accessibility' },
  { keywords: ['a11y'], tag: 'A11y' },
  { keywords: ['section 508', '508 compliance'], tag: 'Section 508' },
  { keywords: ['vpat', 'voluntary product accessibility'], tag: 'VPAT' },
];

/**
 * Check if a job is relevant to accessibility based on title and description.
 * @param {string} title 
 * @param {string} description 
 * @returns {boolean}
 */
function isRelevantJob(title, description) {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  return ACCESSIBILITY_KEYWORDS.some(kw => text.includes(kw));
}

/**
 * Infer accessibility-related tags from job title and description.
 * @param {string} title 
 * @param {string} description 
 * @returns {string[]}
 */
function inferTags(title, description) {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  const tags = [];

  for (const rule of TAG_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      tags.push(rule.tag);
    }
  }

  return tags.length > 0 ? tags : ['Accessibility'];
}

/**
 * Normalize a raw provider job into the standard internal schema.
 * Validates required fields and sets defaults for optional ones.
 * 
 * @param {Object} raw - Raw job data from a provider
 * @returns {Object|null} - Normalized job object, or null if invalid
 */
function normalizeJob(raw) {
  // Required fields
  if (!raw.title || !raw.applyUrl) return null;

  return {
    provider: raw.provider || 'unknown',
    providerJobId: raw.providerJobId || null,
    title: (raw.title || '').trim(),
    company: (raw.company || 'Unknown Company').trim(),
    description: (raw.description || '').trim(),
    location: (raw.location || 'Remote / Unknown').trim(),
    applyUrl: (raw.applyUrl || '').trim(),
    companyLogo: raw.companyLogo || null,
    salaryMin: raw.salaryMin || null,
    salaryMax: raw.salaryMax || null,
    currency: raw.currency || null,
    employmentType: raw.employmentType || 'Full-time',
    isRemote: Boolean(raw.isRemote),
    postedDate: raw.postedDate || null,
    tags: inferTags(raw.title, raw.description)
  };
}

/**
 * Truncate a description to a preview length.
 * @param {string} description 
 * @param {number} maxLength 
 * @returns {string}
 */
function truncateDescription(description, maxLength = 300) {
  if (!description || description.length <= maxLength) return description || '';
  return description.substring(0, maxLength) + '...';
}

module.exports = {
  normalizeJob,
  inferTags,
  isRelevantJob,
  truncateDescription,
  detectCountryCode,
  ACCESSIBILITY_KEYWORDS,
  TAG_RULES
};
