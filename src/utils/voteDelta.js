function voteDelta(currentVote, nextDirection) {
  const nextValue = nextDirection === 'up' ? 1 : -1;
  if (currentVote === nextDirection) {
    return { delta: -nextValue, userVote: null };
  }
  if (currentVote === null) {
    return { delta: nextValue, userVote: nextDirection };
  }
  const currentValue = currentVote === 'up' ? 1 : -1;
  return { delta: nextValue - currentValue, userVote: nextDirection };
}

export { voteDelta };
