import styles from './ScreenReaderModal.module.css';

export default function ShortcutsEditor({ items, onChange }) {
  const handleAddSection = () => {
    onChange([...items, { section: '', rows: [{ action: '', cmd: '' }] }]);
  };

  const handleRemoveSection = (sectionIndex) => {
    onChange(items.filter((_, i) => i !== sectionIndex));
  };

  const handleChangeSection = (sectionIndex, newName) => {
    const newItems = [...items];
    newItems[sectionIndex].section = newName;
    onChange(newItems);
  };

  const handleAddRow = (sectionIndex) => {
    const newItems = [...items];
    newItems[sectionIndex].rows.push({ action: '', cmd: '' });
    onChange(newItems);
  };

  const handleRemoveRow = (sectionIndex, rowIndex) => {
    const newItems = [...items];
    newItems[sectionIndex].rows = newItems[sectionIndex].rows.filter((_, i) => i !== rowIndex);
    onChange(newItems);
  };

  const handleChangeRow = (sectionIndex, rowIndex, field, value) => {
    const newItems = [...items];
    newItems[sectionIndex].rows[rowIndex][field] = value;
    onChange(newItems);
  };

  return (
    <div className={styles.nestedList}>
      {items.map((section, sectionIndex) => (
        <div key={sectionIndex} className={styles.nestedItem} style={{ flexDirection: 'column', padding: '16px', background: '#f8fafc' }}>
          <div style={{ display: 'flex', width: '100%', gap: '12px', alignItems: 'center' }}>
            <input 
              type="text" 
              className={styles.input} 
              value={section.section || ''} 
              onChange={e => handleChangeSection(sectionIndex, e.target.value)}
              placeholder="Section Name (e.g. Essential controls)"
              aria-label="Section Name"
              title="Section Name"
              style={{ fontWeight: 'bold' }}
              required
            />
            <button type="button" onClick={() => handleRemoveSection(sectionIndex)} className={styles.removeBtn} title="Remove Section">
              ✕
            </button>
          </div>
          
          <div className={styles.nestedList} style={{ width: '100%' }}>
            {section.rows.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.nestedItem} style={{ padding: '8px' }}>
                <div className={styles.rowGroup} style={{ marginBottom: 0, width: '100%' }}>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={row.action || ''} 
                    onChange={e => handleChangeRow(sectionIndex, rowIndex, 'action', e.target.value)}
                    placeholder="Action (e.g. Stop speaking)"
                    aria-label="Action"
                    title="Action"
                    required
                  />
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={row.cmd || ''} 
                    onChange={e => handleChangeRow(sectionIndex, rowIndex, 'cmd', e.target.value)}
                    placeholder="Command (e.g. Ctrl)"
                    aria-label="Command"
                    title="Command"
                    required
                  />
                </div>
                <button type="button" onClick={() => handleRemoveRow(sectionIndex, rowIndex)} className={styles.removeBtn} title="Remove Row">
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddRow(sectionIndex)} className={styles.addItemBtn} style={{ padding: '8px' }}>
              + Add Shortcut Row
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={handleAddSection} className={styles.addItemBtn}>
        + Add Shortcut Section
      </button>
    </div>
  );
}
