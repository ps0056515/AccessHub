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

export const exportToExcel = (data, filename) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
