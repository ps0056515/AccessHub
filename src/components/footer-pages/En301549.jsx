import { Link } from 'react-router-dom';
import { SITE_NAME } from '../../brand';

const OFFICIAL_PDF =
  'https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf';
const ETSI_OVERVIEW =
  'https://www.etsi.org/human-factors-accessibility/en-301-549-v3-the-harmonized-european-standard-for-ict-accessibility';
export default function En301549() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>EN 301 549</h1>
      <p style={{ lineHeight: 1.7, color: 'var(--text-muted)' }}>
        EN 301 549 is the European standard for accessibility requirements for ICT products and
        services. It is widely used for public procurement and aligns with WCAG 2.1 for web
        content.
      </p>

      <section style={{ marginTop: '2rem' }} aria-labelledby="en-links-heading">
        <h2 id="en-links-heading" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          Official resources
        </h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li>
            <a href={OFFICIAL_PDF} target="_blank" rel="noopener noreferrer">
              EN 301 549 V3.2.1 (PDF) — ETSI
            </a>
          </li>
          <li>
            <a href={ETSI_OVERVIEW} target="_blank" rel="noopener noreferrer">
              ETSI overview — harmonized European standard for ICT accessibility
            </a>
          </li>
          <li>
            <Link to="/resources">Browse accessibility resources on {SITE_NAME}</Link> in our
            community library.
          </li>        </ul>
      </section>

      <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Related:{' '}
        <Link to="/">Community discussions</Link>
        {' · '}
        <Link to="/contact">Contact us</Link>
      </p>
    </div>
  );
}
