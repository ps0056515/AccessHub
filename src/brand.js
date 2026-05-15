/** Brand tokens shared across UI (logo file lives in `public/`). */
export const SITE_NAME = 'All Can Access';

export function logoUrl() {
  const base = process.env.PUBLIC_URL || '';
  return `${base}/allcanaccess.jpg`;
}
