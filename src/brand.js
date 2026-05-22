/** Brand tokens shared across UI (logo file lives in `public/`). */
export const SITE_NAME = "AllCanAccess";

const base = process.env.PUBLIC_URL || "";
export function logoUrl() {
  return `${base}/allcanaccess.png`;
}

export function footerLogoUrl() {
  return `${base}/allcanaccess_footer.png`;
}
