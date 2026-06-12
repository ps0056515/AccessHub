import { Link } from 'react-router-dom';
import { SITE_NAME } from 'brand';
import styles from './En301549.module.css';

const OFFICIAL_PDF =
  'https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf';
const ETSI_OVERVIEW =
  'https://www.etsi.org/human-factors-accessibility/en-301-549-v3-the-harmonized-european-standard-for-ict-accessibility';
export default function En301549() {
  return (
    <div className={styles.container}>
      <h1>EN 301 549</h1>
      <p className={styles.description}>
        EN 301 549 is the European standard for accessibility requirements for ICT products and
        services. It is widely used for public procurement and aligns with WCAG 2.1 for web
        content.
      </p>

      <section className={styles.section} aria-labelledby="en-links-heading">
        <h2 id="en-links-heading" className={styles.heading}>
          Official resources
        </h2>
        <ul className={styles.list}>
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

      <p className={styles.related}>
        Related:{' '}
        <Link to="/">Community discussions</Link>
        {' · '}
        <Link to="/contact">Contact us</Link>
      </p>
    </div>
  );
}
