import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Info, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { SITE_NAME } from 'brand';
import styles from './En301549.module.css';

const SECTIONS = [
  { id: 'overview', title: 'Overview & Scope' },
  { id: 'history', title: 'History & Versions' },
  { id: 'relationships', title: 'Global Relationships' },
  { id: 'structure', title: 'Document Structure' },
  { id: 'conformance', title: 'Conformance & Testing' },
  { id: 'procurement', title: 'Public Procurement' },
  { id: 'misconceptions', title: 'Common Misconceptions' },
  { id: 'references', title: 'Official References' },
];

export default function En301549() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible section
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by intersection ratio (highest first) or simply take the first
          const mostVisible = visibleEntries.reduce((prev, current) => 
            (prev.intersectionRatio > current.intersectionRatio) ? prev : current
          );
          setActiveSection(mostVisible.target.id);
        }
      },
      { rootMargin: '-120px 0px -40% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      <Helmet>
        <title>EN 301 549 - European ICT Accessibility Standard | {SITE_NAME}</title>
        <meta
          name="description"
          content="Comprehensive enterprise guide to EN 301 549, the European standard for accessibility requirements for ICT products and services, including its relationship to WCAG 2.1 and the EAA."
        />
      </Helmet>

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>EN 301 549</h1>
        <p className={styles.heroSubtitle}>
          Accessibility requirements for ICT products and services
        </p>
      </header>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <nav className={styles.tocNav} aria-label="Table of Contents">
            <h2 className={styles.tocTitle}>Table of Contents</h2>
            <ul className={styles.tocList}>
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className={`${styles.tocLink} ${
                      activeSection === section.id ? styles.tocLinkActive : ''
                    }`}
                    aria-current={activeSection === section.id ? 'true' : undefined}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className={styles.content}>
          <article>
            {/* OVERVIEW SECTION */}
            <section id="overview" className={styles.section} aria-labelledby="heading-overview">
              <h2 id="heading-overview" className={styles.sectionTitle}>Overview & Scope</h2>
              
              <h3 className={styles.subSectionTitle}>What is EN 301 549?</h3>
              <p className={styles.paragraph}>
                <strong>EN 301 549</strong> is the harmonised European standard that specifies the functional accessibility requirements applicable to Information and Communication Technology (ICT) products and services. Originally developed jointly by the three European Standardization Organizations (CEN, CENELEC, and ETSI) under a mandate from the European Commission, it serves as the definitive accessibility baseline for digital products within the European Union.
              </p>

              <h3 className={styles.subSectionTitle}>Purpose</h3>
              <p className={styles.paragraph}>
                The primary purpose of EN 301 549 is to ensure that ICT products and services—ranging from websites and mobile applications to hardware and operating systems—are accessible to all users, including persons with visual, auditory, physical, cognitive, and neurological disabilities. It provides a technical baseline for demonstrating compliance with European accessibility legislation, most notably the Web Accessibility Directive (WAD) and the impending European Accessibility Act (EAA).
              </p>

              <h3 className={styles.subSectionTitle}>Scope</h3>
              <p className={styles.paragraph}>
                Unlike the Web Content Accessibility Guidelines (WCAG) which primarily focus on web-based content, the scope of EN 301 549 is significantly broader. It covers:
              </p>
              <ul className={styles.list}>
                <li><strong>Web content</strong> (incorporating WCAG by reference)</li>
                <li><strong>Non-web documents</strong> (e.g., PDFs, Word documents)</li>
                <li><strong>Software</strong> (including mobile applications, desktop software, and operating systems)</li>
                <li><strong>Hardware</strong> (including ATMs, ticketing machines, smartphones, and computers)</li>
                <li><strong>Two-way voice and video communication</strong></li>
                <li><strong>Support documentation and services</strong></li>
              </ul>

              <h3 className={styles.subSectionTitle}>Who Must Follow It</h3>
              <div className={styles.callout}>
                <Info className={styles.calloutIcon} aria-hidden="true" size={24} />
                <div className={styles.calloutContent}>
                  <span className={styles.calloutTitle}>Applicability</span>
                  <p className={styles.calloutText}>
                    Historically, EN 301 549 applied strictly to <strong>public sector bodies</strong> across the EU via the Web Accessibility Directive (WAD) and public procurement rules. However, with the enforcement of the European Accessibility Act (EAA) in 2025, the standard's technical requirements are expanding to encompass many <strong>private sector entities</strong> providing specific ICT products and services within the EU market.
                  </p>
                </div>
              </div>
            </section>

            {/* HISTORY SECTION */}
            <section id="history" className={styles.section} aria-labelledby="heading-history">
              <h2 id="heading-history" className={styles.sectionTitle}>History & Version Evolution</h2>
              <p className={styles.paragraph}>
                The standard has evolved significantly to keep pace with technological advancements and updates to international guidelines like WCAG. Understanding the version history is critical for procurement and compliance auditing.
              </p>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <caption>Evolution of EN 301 549 Versions</caption>
                  <thead>
                    <tr>
                      <th scope="col">Version</th>
                      <th scope="col">Release Date</th>
                      <th scope="col">WCAG Alignment</th>
                      <th scope="col">Key Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>V1.1.2</td>
                      <td>April 2015</td>
                      <td>WCAG 2.0 (Level AA)</td>
                      <td>The inaugural publication resulting from Mandate 376.</td>
                    </tr>
                    <tr>
                      <td>V2.1.2</td>
                      <td>August 2018</td>
                      <td>WCAG 2.1 (Level AA)</td>
                      <td>First major update, formally adopting WCAG 2.1 to support the Web Accessibility Directive.</td>
                    </tr>
                    <tr>
                      <td>V3.1.1</td>
                      <td>November 2019</td>
                      <td>WCAG 2.1 (Level AA)</td>
                      <td>Clarified requirements for mobile applications to further support the WAD.</td>
                    </tr>
                    <tr>
                      <td><strong>V3.2.1</strong></td>
                      <td><strong>March 2021</strong></td>
                      <td><strong>WCAG 2.1 (Level AA)</strong></td>
                      <td><strong>The current harmonised standard.</strong> Includes minor editorial corrections and clarifications over V3.1.1.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={styles.callout} className={`${styles.callout} ${styles.warning}`}>
                <AlertTriangle className={styles.calloutIcon} aria-hidden="true" size={24} />
                <div className={styles.calloutContent}>
                  <span className={styles.calloutTitle}>Future Evolution (V4.x and WCAG 2.2)</span>
                  <p className={styles.calloutText}>
                    While V3.2.1 relies on WCAG 2.1, a future version (likely V4.x) is currently being drafted under Standardization Request M/587 to support the European Accessibility Act (EAA). This upcoming version is expected to formally integrate WCAG 2.2 criteria. Until it is published and harmonised in the Official Journal of the EU (OJEU), V3.2.1 remains the official baseline.
                  </p>
                </div>
              </div>
            </section>

            {/* RELATIONSHIPS SECTION */}
            <section id="relationships" className={styles.section} aria-labelledby="heading-relationships">
              <h2 id="heading-relationships" className={styles.sectionTitle}>Global Relationships</h2>

              <h3 className={styles.subSectionTitle}>Relationship with WCAG</h3>
              <p className={styles.paragraph}>
                EN 301 549 heavily references the W3C Web Content Accessibility Guidelines (WCAG). Specifically, <strong>Clause 9 (Web)</strong> directly points to WCAG 2.1 Level A and AA success criteria. Furthermore, EN 301 549 brilliantly adapts WCAG principles for non-web environments (such as PDFs in Clause 10 and native software in Clause 11), mapping web-centric terms like "web page" to "non-web document" or "software interface".
              </p>

              <h3 className={styles.subSectionTitle}>Relationship with the European Accessibility Act (EAA)</h3>
              <p className={styles.paragraph}>
                The European Accessibility Act (Directive (EU) 2019/882) is a legislative directive mandating accessibility for a wide range of private sector products and services (e.g., e-commerce, banking, smartphones). EN 301 549 provides the <em>technical specifications</em> to presume conformity with the legal requirements of the EAA. If a company builds an e-commerce platform compliant with EN 301 549, they are generally presumed to meet the technical demands of the EAA for that interface.
              </p>

              <h3 className={styles.subSectionTitle}>Relationship with VPAT</h3>
              <p className={styles.paragraph}>
                A Voluntary Product Accessibility Template (VPAT) is a standardized document used to report how a product conforms to accessibility standards. The Information Technology Industry Council (ITI) provides four editions of the VPAT. One of these is explicitly the <strong>VPAT EU edition</strong>, which maps product features directly against the clauses of EN 301 549.
              </p>

              <h3 className={styles.subSectionTitle}>Relationship with Section 508</h3>
              <p className={styles.paragraph}>
                Section 508 of the Rehabilitation Act is the United States federal procurement standard for accessible ICT. While Section 508 and EN 301 549 share the same foundation (WCAG), EN 301 549 is generally considered broader. For example, EN 301 549 includes specific requirements for biometrics and hardware that Section 508 addresses differently or less extensively. However, a product built to comply with EN 301 549 will largely meet Section 508 requirements, though separate conformance reporting (via a VPAT) is still required for US federal procurement.
              </p>
            </section>

            {/* STRUCTURE SECTION */}
            <section id="structure" className={styles.section} aria-labelledby="heading-structure">
              <h2 id="heading-structure" className={styles.sectionTitle}>Document Structure</h2>
              <p className={styles.paragraph}>
                EN 301 549 is divided into 13 main clauses (chapters) alongside several informative annexes. Understanding this structure is essential for targeting the requirements applicable to a specific product.
              </p>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <caption>Core Clauses of EN 301 549 V3.2.1</caption>
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: '15%' }}>Clause</th>
                      <th scope="col" style={{ width: '30%' }}>Title / Subject</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Clause 4</strong></td>
                      <td>Functional performance statements</td>
                      <td>Explains the user needs (e.g., usage without vision, usage with limited manipulation) that the technical requirements aim to fulfill.</td>
                    </tr>
                    <tr>
                      <td><strong>Clause 5</strong></td>
                      <td>Generic requirements</td>
                      <td>Base requirements applicable to all ICT, including closed functionality (where user assistive technology cannot be attached) and biometrics.</td>
                    </tr>
                    <tr>
                      <td><strong>Clause 8</strong></td>
                      <td>Hardware</td>
                      <td>Requirements for physical components, physical controls, displays, and tactile indicators (e.g., ATMs, kiosks).</td>
                    </tr>
                    <tr>
                      <td><strong>Clause 9</strong></td>
                      <td>Web</td>
                      <td>Stipulates that web content must conform to WCAG 2.1 Level A and AA.</td>
                    </tr>
                    <tr>
                      <td><strong>Clause 10</strong></td>
                      <td>Non-web documents</td>
                      <td>Applies WCAG 2.1 principles to documents not delivered via the web (e.g., PDF, DOCX).</td>
                    </tr>
                    <tr>
                      <td><strong>Clause 11</strong></td>
                      <td>Software</td>
                      <td>Applies WCAG 2.1 principles to non-web software interfaces, including mobile apps and desktop software. Includes platform accessibility services (APIs).</td>
                    </tr>
                    <tr>
                      <td><strong>Clause 12</strong></td>
                      <td>Documentation and support</td>
                      <td>Requires that product documentation (manuals, help desks) is accessible and explains the accessibility features of the product.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <blockquote className={styles.blockquote}>
                "The strength of EN 301 549 lies in its translation of web-based accessibility principles into a unified framework that covers software, hardware, and closed-system environments."
              </blockquote>
            </section>

            {/* CONFORMANCE SECTION */}
            <section id="conformance" className={styles.section} aria-labelledby="heading-conformance">
              <h2 id="heading-conformance" className={styles.sectionTitle}>Conformance & Testing</h2>
              <p className={styles.paragraph}>
                EN 301 549 does not mandate a specific automated testing tool or certification body. Conformance is a self-declared or third-party audited status based on verifiable technical testing.
              </p>
              
              <h3 className={styles.subSectionTitle}>Annex C: Determination of Compliance</h3>
              <p className={styles.paragraph}>
                A critical, often overlooked part of EN 301 549 is <strong>Annex C</strong>. This normative annex provides the exact testing procedures and evaluation methods to determine whether an ICT product meets the requirements in Clauses 5 through 13. When creating an Accessibility Statement or a VPAT, testers must refer to Annex C to ensure their testing methodology aligns with European expectations.
              </p>
            </section>

            {/* PROCUREMENT SECTION */}
            <section id="procurement" className={styles.section} aria-labelledby="heading-procurement">
              <h2 id="heading-procurement" className={styles.sectionTitle}>Public Procurement</h2>
              <p className={styles.paragraph}>
                EN 301 549 was explicitly created to harmonize public procurement rules. If you wish to sell ICT products or services to any government agency, university, or public hospital within the EU, your product must conform to EN 301 549.
              </p>
              <p className={styles.paragraph}>
                Vendors are typically required to submit an Accessibility Conformance Report (ACR)—usually generated using the VPAT EU edition—as part of their tender response. Failure to demonstrate conformance can result in disqualification from the procurement process.
              </p>
            </section>

            {/* MISCONCEPTIONS SECTION */}
            <section id="misconceptions" className={styles.section} aria-labelledby="heading-misconceptions">
              <h2 id="heading-misconceptions" className={styles.sectionTitle}>Common Misconceptions</h2>
              
              <ul className={styles.list}>
                <li>
                  <strong>Misconception:</strong> EN 301 549 is just "European WCAG."<br />
                  <strong>Reality:</strong> While it includes WCAG 2.1 for web content, EN 301 549 is vastly more comprehensive, covering hardware, non-web documents, biometrics, and real-time communication.
                </li>
                <li>
                  <strong>Misconception:</strong> Compliance guarantees legal immunity.<br />
                  <strong>Reality:</strong> Standards provide a presumption of conformity to directives like the WAD and EAA. However, legal enforcement and interpretation reside with individual EU Member States.
                </li>
                <li>
                  <strong>Misconception:</strong> Only websites need to comply.<br />
                  <strong>Reality:</strong> Mobile applications, desktop software, self-service terminals, and electronic documents are heavily regulated under this standard.
                </li>
              </ul>
            </section>

            {/* REFERENCES SECTION */}
            <section id="references" className={styles.section} aria-labelledby="heading-references">
              <h2 id="heading-references" className={styles.sectionTitle}>Official References</h2>
              <p className={styles.paragraph}>
                Ensure you are referencing the official standard documents when making compliance decisions.
              </p>

              <ul className={styles.list}>
                <li>
                  <a 
                    href="https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    <FileText aria-hidden="true" size={16} />
                    EN 301 549 V3.2.1 Official PDF (ETSI)
                    <span className={styles.srOnly}>(opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.etsi.org/human-factors-accessibility/en-301-549-v3-the-harmonized-european-standard-for-ict-accessibility" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    <ExternalLink aria-hidden="true" size={16} />
                    ETSI Overview of EN 301 549
                    <span className={styles.srOnly}>(opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://eur-lex.europa.eu/eli/dir/2019/882/oj" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    <ExternalLink aria-hidden="true" size={16} />
                    Directive (EU) 2019/882 (European Accessibility Act)
                    <span className={styles.srOnly}>(opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.w3.org/WAI/standards-guidelines/wcag/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    <ExternalLink aria-hidden="true" size={16} />
                    W3C Web Content Accessibility Guidelines (WCAG) Overview
                    <span className={styles.srOnly}>(opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.itic.org/policy/accessibility/vpat" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    <ExternalLink aria-hidden="true" size={16} />
                    ITI VPAT Editions (including EU)
                    <span className={styles.srOnly}>(opens in a new tab)</span>
                  </a>
                </li>
              </ul>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
