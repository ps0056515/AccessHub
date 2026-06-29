function relativeTime(iso) {
  if (!iso) return '';
  const normalized =
    iso instanceof Date
      ? iso.toISOString()
      : typeof iso === 'string' && iso.includes('T')
        ? iso
        : typeof iso === 'string'
          ? `${iso.replace(' ', 'T')}Z`
          : String(iso);
  const then = new Date(normalized).getTime();
  if (Number.isNaN(then)) return iso;

  const diffSec = Math.floor((Date.now() - then) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  const dateObj = new Date(then);
  const isCurrentYear = dateObj.getFullYear() === new Date().getFullYear();
  if (!isCurrentYear) {
    return dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function parseTags(raw) {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatPost(row, replyCount) {
  const tags = parseTags(row.tags);
  let userVote = null;
  if (row.user_vote_direction === 1) userVote = 'up';
  if (row.user_vote_direction === -1) userVote = 'down';

  return {
    id: row.id,
    userId: row.user_id,
    votes: row.votes,
    userVote,
    initials: row.author_initials,
    color: row.author_color,
    author: row.author_name,
    country: row.country,
    role: row.author_role || 'Community member',
    time: relativeTime(row.created_at),
    raw_time: row.created_at,
    updated_at: row.updated_at,
    replies: replyCount ?? row.reply_count ?? 0,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    tags,
    tagColors: tags.map(() => row.author_color || 'blue'),
  };
}

function formatComment(row) {
  return {
    id: row.id,
    userId: row.user_id,
    author: row.author_name,
    country: row.country,
    initials: row.author_initials,
    color: row.author_color,
    time: relativeTime(row.created_at),
    raw_time: row.created_at,
    body: row.body,
  };
}

function authorFromUser(user) {
  const parts = user.display_name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0]?.slice(0, 2).toUpperCase() || 'U';
  return {
    author_name: user.display_name,
    author_initials: initials,
    author_color: 'blue',
    author_role: user.role || 'Community member',
    country: user.country,
  };
}

module.exports = { relativeTime, formatPost, formatComment, authorFromUser, parseTags };
