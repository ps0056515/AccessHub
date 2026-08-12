import { Link } from 'react-router-dom';
import { SITE_NAME } from 'brand';
import styles from './Contribute.module.css';

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
    <div className={styles.container}>
      <h1>Contribute</h1>
      <p className={styles.intro}>
        {SITE_NAME} is built by practitioners sharing knowledge. Here is how to contribute
        discussions, guides, and feedback to the community.
      </p>

      <section className={styles.section} aria-labelledby="guidelines-heading">
        <h2 id="guidelines-heading" className={styles.sectionTitle}>
          Contribution guidelines
        </h2>
        <ul className={styles.list}>
          {GUIDELINES.map((item) => (
            <li
              key={item.title}
              className={styles.card}
            >
              <strong>{item.title}</strong>
              <p className={styles.cardBody}>
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="workflow-heading">
        <h2 id="workflow-heading" className={styles.sectionTitle}>
          Contribution workflow
        </h2>
        <ol className={styles.list}>
          {WORKFLOW.map((item) => (
            <li
              key={item.step}
              className={styles.workflowCard}
            >
              <p className={styles.cardTitle}>
                {item.step}. {item.title}
              </p>
              <p className={styles.cardBody}>
                {item.body}
              </p>
              {item.cta && (
                <p className={styles.cardAction}>
                  {item.cta.action === 'ask' ? (
                    <Link
                      to={item.cta.to}
                      onClick={queueStartDiscussion}
                      className={styles.link}
                    >
                      {item.cta.label} <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <Link
                      to={item.cta.to}
                      className={styles.link}
                    >
                      {item.cta.label} <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="other-ways-heading">
        <h2 id="other-ways-heading" className={styles.sectionTitle}>
          Other ways to help
        </h2>
        <ul className={styles.otherWaysList}>
          <li>
            <Link to="/events" className={styles.textLink}>Suggest an event or workshop</Link> the community should know about.
          </li>
          <li>
            Report accessibility issues via our{' '}
            <Link to="/accessibility" className={styles.textLink}>accessibility statement</Link>.
          </li>
          <li>
            Reach out directly on the <Link to="/contact" className={styles.textLink}>contact page</Link> for partnerships or
            moderation questions.
          </li>
        </ul>
      </section>
    </div>
  );
}
