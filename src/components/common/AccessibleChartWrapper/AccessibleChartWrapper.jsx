import React, { useState } from 'react';
import styles from './AccessibleChartWrapper.module.css';

/**
 * Wraps a visual SVG chart (like recharts) with an accessible HTML table.
 * The SVG is hidden from screen readers, and the table is visually hidden but readable by screen readers.
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the chart (for screen readers)
 * @param {Array} props.data - The data array used in the chart
 * @param {Array<{key: string, label: string}>} props.columns - Configuration for table columns
 * @param {React.ReactNode} props.children - The visual chart component
 */
export default function AccessibleChartWrapper({ title, data, columns, children }) {
  const [showTable, setShowTable] = useState(false);

  if (!data || data.length === 0) return children;

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerControls}>
        <button
          type="button"
          onClick={() => setShowTable((prev) => !prev)}
          className={styles.toggleBtn}
          aria-expanded={showTable}
        >
          {showTable ? `Hide data table for ${title}` : `Show data table for ${title}`}
        </button>
      </div>

      {/* Hide the visual SVG chart from screen readers and toggle display for keyboard users */}
      <div aria-hidden="true" style={{ width: '100%', height: '100%', display: showTable ? 'none' : 'block' }}>
        {children}
      </div>

      {/* Data table */}
      <table className={showTable ? styles.visibleTable : styles.srOnly} aria-label={`Data table for ${title}`}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col, colIndex) => {
                if (colIndex === 0) {
                  return <th key={col.key} scope="row">{row[col.key]}</th>;
                }
                return <td key={col.key}>{row[col.key]}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
