import { Link } from 'react-router-dom';
import styles from './ContentCard.module.css';

export default function ContentCard({ to, image, title, author, date, typeIcon = '📰' }) {
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.imageWrapper}>
        {image ? (
          <img src={image} alt="" className={styles.cardImage} />
        ) : (
          <div className={styles.placeholderIcon}>{typeIcon}</div>
        )}
      </div>
      <div className={styles.cardContent}>
        <h2 className={styles.cardTitle}>{title}</h2>
        <div className={styles.cardMeta}>
          <span>{author}</span>
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}
