import styles from './ScreenReaderModal.module.css';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
const quillModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
  keyboard: {
    bindings: {
      tab: false,
    },
  },
};

export default function StepsEditor({ items, onChange }) {
  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const handleAdd = () => {
    onChange([...items, { title: '', desc: '' }]);
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };


  return (
    <div className={styles.nestedList}>
      {items.map((step, index) => (
        <div key={index} className={styles.nestedItem}>
          <div className={styles.nestedItemContent}>
            <input
              type="text"
              className={styles.input}
              value={step.title || ''}
              onChange={e => handleChange(index, 'title', e.target.value)}
              placeholder={`Step ${index + 1} Title`}
              aria-label={`Step ${index + 1} Title`}
              title={`Step ${index + 1} Title`}
              required
            />
            <div className={styles.editorWrapper}>
              <ReactQuill
                theme="snow"
                value={step.desc || ""}
                onChange={(value, delta, source) => {
                  if (source === "user") {
                    handleChange(index, "desc", value);
                  }
                }}
                modules={quillModules}
              />
            </div>
          </div>
          <button type="button" onClick={() => handleRemove(index)} className={styles.removeBtn} title="Remove Step">
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={handleAdd} className={styles.addItemBtn}>
        + Add Step
      </button>
    </div>
  );
}
