import React from 'react';
import Tooltip from 'components/common/Tooltip/Tooltip';

export const truncateText = (
  value,
  maxLength = 25,
  position = "bottom"
) => {
  if (!value) return null;

  const shouldTruncate = value.length > maxLength;
  return shouldTruncate ? (
    <Tooltip content={value} position={position}>
      <span>{value.substring(0, maxLength)}...</span>
    </Tooltip>
  ) : (
    <span>{value}</span>
  );
};
