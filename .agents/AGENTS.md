# Project Accessibility Rules

**Accessibility-First Development**
For all code written, refactored, or reviewed within this project (AccessHub), you must prioritize accessibility natively:
- **Keyboard Navigation**: Ensure all interactive elements (buttons, links, inputs, dropdowns) are reachable and operable via the keyboard (`Tab`, `Enter`, `Space`, `Escape`, arrow keys). Ensure event bubbling does not hijack child element keyboard events.
- **Screen Reader Compatibility**: Always use appropriate ARIA attributes (`aria-label`, `aria-labelledby`, `aria-describedby`, `aria-expanded`, `aria-haspopup`, `aria-invalid`, `aria-live`, etc.) to convey name, role, state, and value dynamically to screen readers (like NVDA).
- **Form Validation**: Error messages MUST be linked to their respective inputs using `aria-invalid="true"` and `aria-describedby="[error-id]"`.
- **Semantic HTML**: Prioritize native HTML5 semantic elements (`<nav>`, `<main>`, `<article>`, `<button>`, `<dialog>`) over generic `<div>` or `<span>` elements with custom ARIA roles wherever possible.
- **Zero-Compromise**: If an implementation choice requires sacrificing accessibility for aesthetics or speed, ask for clarification. Accessibility is a hard requirement.
