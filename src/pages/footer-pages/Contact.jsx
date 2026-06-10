import { Link } from 'react-router-dom';
import { SITE_NAME } from 'brand';

export default function Contact() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Contact</h1>
      <p style={{ lineHeight: 1.7, color: 'var(--text-muted)' }}>
        Get in touch with the {SITE_NAME} team. We welcome feedback, partnership ideas, and
        accessibility questions.
      </p>
      <p style={{ marginTop: '1.5rem' }}>
        Email:{' '}
        <a href="mailto:contactus@allcanaccess.com">contactus@allcanaccess.com</a>
      </p>
      <p style={{ marginTop: '1rem' }}>
        Prefer to post publicly? Start a discussion on the{' '}
        <Link to="/">community page</Link>.
      </p>
    </div>
  );
}
