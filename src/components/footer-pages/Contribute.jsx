import { Link } from 'react-router-dom';
import { SITE_NAME } from '../../brand';

const GUIDELINES = [
  {
    title: 'Be specific and practical',
    body: 'Share real scenarios, tools, or code patterns others can apply. Include context such as WCAG criterion, assistive technology, or browser when relevant.',
  },
  {
    title: 'Respect the community',
    body: 'Assume good intent. Critique ideas, not people. Avoid gatekeeping — practitioners at every level are welcome.',
  },
  {
    title: 'Cite sources when you can',
    body: 'Link to standards, documentation, or research. If you are sharing opinion, say so clearly.',
  },
  {
    title: 'Keep accessibility in mind',
    body: 'Use clear headings, descriptive link text, and plain language so everyone can participate.',
  },
];

const WORKFLOW = [
  {
    step: '1',
    title: 'Create an account',
    body: 'Sign in or join the community so your posts and replies are attributed to you.',
    cta: { label: 'Join community', to: '/sign-up' },
  },
  {
    step: '2',
    title: 'Choose how to contribute',
    body: 'Start a discussion, reply to an existing thread, share an event tip, or suggest a resource for the library.',
  },
  {
    step: '3',
    title: 'Post your contribution',
    body: 'Pick a topic, write your question or guide, and publish it to the community feed.',
    cta: { label: 'Start a discussion', to: '/', action: 'ask' },
  },
  {
    step: '4',
    title: 'Stay engaged',
    body: 'Follow up on replies, upvote helpful answers, and refine your post if something was unclear.',
  },
];

export default function Contribute() {
  const queueStartDiscussion = () => {
    sessionStorage.setItem('aa-nav', JSON.stringify({ focusAsk: true }));
  };

  return (
    <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Contribute</h1>
      <p style={{ lineHeight: 1.7, color: 'var(--text-muted)' }}>
        {SITE_NAME} is built by practitioners sharing knowledge. Here is how to contribute
        discussions, guides, and feedback to the community.
      </p>

      <section style={{ marginTop: '2.5rem' }} aria-labelledby="guidelines-heading">
        <h2 id="guidelines-heading" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          Contribution guidelines
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
          {GUIDELINES.map((item) => (
            <li
              key={item.title}
              style={{
                padding: '1rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--bg-card, #fff)',
              }}
            >
              <strong>{item.title}</strong>
              <p style={{ margin: '0.5rem 0 0', lineHeight: 1.65, color: 'var(--text-muted)' }}>
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: '2.5rem' }} aria-labelledby="workflow-heading">
        <h2 id="workflow-heading" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          Contribution workflow
        </h2>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
          {WORKFLOW.map((item) => (
            <li
              key={item.step}
              style={{
                padding: '1rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>
                {item.step}. {item.title}
              </p>
              <p style={{ margin: '0.5rem 0 0', lineHeight: 1.65, color: 'var(--text-muted)' }}>
                {item.body}
              </p>
              {item.cta && (
                <p style={{ margin: '0.75rem 0 0' }}>
                  {item.cta.action === 'ask' ? (
                    <Link
                      to={item.cta.to}
                      onClick={queueStartDiscussion}
                      style={{ color: 'var(--accent, #074a9e)', fontWeight: 500 }}
                    >
                      {item.cta.label} →
                    </Link>
                  ) : (
                    <Link
                      to={item.cta.to}
                      style={{ color: 'var(--accent, #074a9e)', fontWeight: 500 }}
                    >
                      {item.cta.label} →
                    </Link>
                  )}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section style={{ marginTop: '2.5rem' }} aria-labelledby="other-ways-heading">
        <h2 id="other-ways-heading" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          Other ways to help
        </h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li>
            <Link to="/events">Suggest an event or workshop</Link> the community should know about.
          </li>
          <li>
            Report accessibility issues via our{' '}
            <Link to="/accessibility">accessibility statement</Link>.
          </li>
          <li>
            Reach out directly on the <Link to="/contact">contact page</Link> for partnerships or
            moderation questions.
          </li>
        </ul>
      </section>
    </div>
  );
}
