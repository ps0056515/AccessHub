import { useEffect } from 'react';
import styles from './ScreenReaderModal.module.css';
import StepsEditor from './StepsEditor';
import ShortcutsEditor from './ShortcutsEditor';
import ChecklistEditor from './ChecklistEditor';
import IssuesEditor from './IssuesEditor';

export default function PhaseEditor({ phase, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, index }) {
  // Infer the type if it exists, otherwise default to steps
  const currentType = phase.steps ? 'steps' 
    : phase.shortcuts ? 'shortcuts' 
    : phase.checklist ? 'checklist' 
    : phase.issues ? 'issues' 
    : 'steps';

  const handleChange = (field, value) => {
    onChange({ ...phase, [field]: value });
  };

  const handleTypeChange = (newType) => {
    // To keep it simple, changing type clears out the previous lists
    const newPhase = { id: phase.id, label: phase.label, tip: phase.tip || '' };
    if (newType === 'steps') newPhase.steps = [];
    if (newType === 'shortcuts') newPhase.shortcuts = [];
    if (newType === 'checklist') newPhase.checklist = [];
    if (newType === 'issues') newPhase.issues = [];
    onChange(newPhase);
  };

  return (
    <div className={styles.phaseCard}>
      <div className={styles.phaseHeader}>
        <h4 className={styles.phaseTitle}>Phase {index + 1}: {phase.label || 'Untitled'}</h4>
        <div className={styles.phaseActions}>
          <button type="button" onClick={onMoveUp} disabled={isFirst} className={styles.iconBtn} title="Move Up">↑</button>
          <button type="button" onClick={onMoveDown} disabled={isLast} className={styles.iconBtn} title="Move Down">↓</button>
          <button type="button" onClick={onDelete} className={`${styles.iconBtn} ${styles.danger}`} title="Delete Phase">✕</button>
        </div>
      </div>
      
      <div className={styles.phaseBody}>
        <div className={styles.rowGroup}>
          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
            <label className={styles.label} htmlFor={`phase-id-${index}`}>Phase ID</label>
            <input 
              id={`phase-id-${index}`}
              type="text" 
              className={styles.input} 
              value={phase.id || ''} 
              onChange={e => handleChange('id', e.target.value)}
              placeholder="e.g. install"
              required
            />
          </div>
          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
            <label className={styles.label} htmlFor={`phase-label-${index}`}>Phase Label</label>
            <input 
              id={`phase-label-${index}`}
              type="text" 
              className={styles.input} 
              value={phase.label || ''} 
              onChange={e => handleChange('label', e.target.value)}
              placeholder="e.g. 1 · Install & setup"
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor={`phase-tip-${index}`}>Optional Tip (Displayed at the bottom of the phase)</label>
          <input 
            id={`phase-tip-${index}`}
            type="text" 
            className={styles.input} 
            value={phase.tip || ''} 
            onChange={e => handleChange('tip', e.target.value)}
            placeholder="e.g. Slow down speech rate while learning..."
          />
        </div>

        <div className={styles.typeSelector}>
          {['steps', 'shortcuts', 'checklist', 'issues'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`${styles.typeBtn} ${currentType === t ? styles.active : ''}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.contentEditor}>
          {currentType === 'steps' && (
            <StepsEditor 
              items={phase.steps || []} 
              onChange={val => handleChange('steps', val)} 
            />
          )}
          {currentType === 'shortcuts' && (
            <ShortcutsEditor 
              items={phase.shortcuts || []} 
              onChange={val => handleChange('shortcuts', val)} 
            />
          )}
          {currentType === 'checklist' && (
            <ChecklistEditor 
              items={phase.checklist || []} 
              onChange={val => handleChange('checklist', val)} 
            />
          )}
          {currentType === 'issues' && (
            <IssuesEditor 
              items={phase.issues || []} 
              onChange={val => handleChange('issues', val)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
