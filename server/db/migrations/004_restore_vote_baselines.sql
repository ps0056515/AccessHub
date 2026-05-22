-- Restore seed vote baselines and add recorded post_votes on top.
UPDATE posts AS p
SET votes = b.base_votes + COALESCE(v.delta, 0)
FROM (
  VALUES
    (1, 47),
    (2, 31),
    (3, 89),
    (4, 22),
    (5, 56),
    (6, 38)
) AS b(id, base_votes)
LEFT JOIN (
  SELECT post_id, SUM(direction)::int AS delta
  FROM post_votes
  GROUP BY post_id
) AS v ON v.post_id = b.id
WHERE p.id = b.id;

-- User-created posts: keep stored votes plus any post_votes delta already applied.
UPDATE posts AS p
SET votes = GREATEST(p.votes, 0)
WHERE p.id NOT IN (1, 2, 3, 4, 5, 6);
