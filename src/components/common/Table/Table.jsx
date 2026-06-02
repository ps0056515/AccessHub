import React from 'react';
import styles from './Table.module.css';

export default function Table({ columns, data, emptyMessage = "No records found.", loading = false, getRowStyle, minWidth }) {
  if (loading) {
    return <p className={styles.empty}>Loading...</p>;
  }

  if (!data || data.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.tableScrollWrap}>
      <table className={styles.table} style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th 
                key={col.key || i} 
                style={col.width ? { width: col.width, minWidth: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} style={getRowStyle ? getRowStyle(row) : undefined}>
              {columns.map((col, colIndex) => (
                <td key={col.key || colIndex}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
