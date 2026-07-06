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
  if (!data || data.length === 0) return children;

  return (
    <div className={styles.wrapper}>
      {/* Hide the visual SVG chart from screen readers */}
      <div aria-hidden="true" style={{ width: '100%', height: '100%' }}>
        {children}
      </div>

      {/* Screen-reader-only data table */}
      <table className={styles.srOnly} aria-label={`Data table for ${title}`}>
        <caption>Data table for {title}</caption>
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
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
