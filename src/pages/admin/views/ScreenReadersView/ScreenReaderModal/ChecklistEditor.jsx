import styles from './ScreenReaderModal.module.css';

export default function ChecklistEditor({ items, onChange }) {
  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const handleAdd = () => {
    onChange([...items, { label: '', sub: '', group: '' }]);
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.nestedList}>
      {items.map((item, index) => (
        <div key={index} className={styles.nestedItem}>
          <div className={styles.nestedItemContent}>
            <div className={styles.rowGroup} style={{ marginBottom: '8px' }}>
              <input 
                type="text" 
                className={styles.input} 
                value={item.label || ''} 
                onChange={e => handleChange(index, 'label', e.target.value)}
                placeholder="Checklist Item (e.g. Page title announced correctly)"
                aria-label="Checklist Item"
                title="Checklist Item"
                required
              />
              <input 
                type="text" 
                className={styles.input} 
                value={item.group || ''} 
                onChange={e => handleChange(index, 'group', e.target.value)}
                placeholder="Group Name (e.g. Page structure)"
                aria-label="Group Name"
                title="Group Name"
                required
              />
            </div>
            <textarea 
              className={styles.textarea} 
              value={item.sub || ''} 
              onChange={e => handleChange(index, 'sub', e.target.value)}
              placeholder="Sub-description (e.g. Tab title should uniquely describe...)"
              aria-label="Sub-description"
              title="Sub-description"
              style={{ minHeight: '60px' }}
              required
            />
          </div>
          <button type="button" onClick={() => handleRemove(index)} className={styles.removeBtn} title="Remove Item">
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={handleAdd} className={styles.addItemBtn}>
        + Add Checklist Item
      </button>
    </div>
  );
}
