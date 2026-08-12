import styles from './ScreenReaderModal.module.css';

export default function IssuesEditor({ items, onChange }) {
  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const handleAdd = () => {
    onChange([...items, { sev: 'high', title: '', desc: '' }]);
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.nestedList}>
      {items.map((issue, index) => (
        <div key={index} className={styles.nestedItem}>
          <div className={styles.nestedItemContent}>
            <div className={styles.rowGroup} style={{ marginBottom: '8px' }}>
              <select 
                className={styles.input} 
                value={issue.sev || 'high'} 
                onChange={e => handleChange(index, 'sev', e.target.value)}
                aria-label="Severity"
                title="Severity"
                style={{ flex: '0 0 120px' }}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input 
                type="text" 
                className={styles.input} 
                value={issue.title || ''} 
                onChange={e => handleChange(index, 'title', e.target.value)}
                placeholder="Issue Title (e.g. Ambiguous button and link names)"
                aria-label="Issue Title"
                title="Issue Title"
                required
              />
            </div>
            <textarea 
              className={styles.textarea} 
              value={issue.desc || ''} 
              onChange={e => handleChange(index, 'desc', e.target.value)}
              placeholder="Issue Description"
              aria-label="Issue Description"
              title="Issue Description"
              style={{ minHeight: '60px' }}
              required
            />
          </div>
          <button type="button" onClick={() => handleRemove(index)} className={styles.removeBtn} title="Remove Issue">
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={handleAdd} className={styles.addItemBtn}>
        <span aria-hidden="true">+</span> Add Issue
      </button>
    </div>
  );
}
