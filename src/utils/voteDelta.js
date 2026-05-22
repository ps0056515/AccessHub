function voteDelta(currentVote, nextDirection) {
  if (currentVote === nextDirection) {
    return { delta: nextDirection === 'up' ? -1 : 1, userVote: null };
  }

  if (currentVote === 'down' && nextDirection === 'up') {
    return { delta: 1, userVote: null };
  }

  if (currentVote === 'up' && nextDirection === 'down') {
    return { delta: -1, userVote: null };
  }

  return { delta: nextDirection === 'up' ? 1 : -1, userVote: nextDirection };
}

export { voteDelta };
