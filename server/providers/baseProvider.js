/**
 * Base Provider — Shared contract, normalization, and utilities for all job providers.
 * 
 * Every provider must return jobs matching the normalizedJob schema.
 * No provider-specific response formats should leak outside the provider layer.
 */

const ACCESSIBILITY_KEYWORDS = [
  'accessibil', 'wcag', 'a11y', 'ada ', 'section 508', '508 compliance',
  'screen reader', 'assistive technology', 'inclusive design',
  'vpat', 'jaws', 'nvda', 'voiceover'
];

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
  ACCESSIBILITY_KEYWORDS,
  TAG_RULES
};
