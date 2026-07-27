---
name: WCAG 2.2 AA Enforcement
description: Enforces WCAG 2.2 AA accessibility checks on all new and modified UI elements.
always_on: true
---

# Accessibility Enforcement

Whenever you add or modify UI elements, components, or CSS in this workspace, you MUST adhere to the following WCAG 2.2 AA standards:

1. **Non-text Contrast (WCAG 1.4.11)**: All UI components and graphical objects (including buttons, inputs, icons, borders, and state indicators like focus rings) must have a contrast ratio of at least 3:1 against adjacent colors in both light and dark themes.
2. **Text Contrast (WCAG 1.4.3)**: Regular text must have a contrast ratio of at least 4.5:1. Large text must have a ratio of at least 3:1.
3. **Target Size (WCAG 2.5.8)**: All interactive targets must be at least 24x24 CSS pixels.
4. **Keyboard Accessibility (WCAG 2.1.1)**: All functionality must be operable through a keyboard interface without requiring specific timings for individual keystrokes.
5. **Focus Visible (WCAG 2.4.7)**: Any keyboard operable user interface must have a visible focus indicator. Ensure focus rings are not hidden (`outline: none` without a fallback).
6. **ARIA Usage**: Use semantic HTML by default. If ARIA is necessary, ensure roles, states, and properties are correct and updated dynamically based on component state.
7. **Reflow (WCAG 1.4.10)**: Content must be able to reflow without loss of information or functionality, and without requiring scrolling in two dimensions.

## Action Plan for Modifying/Adding Components:
- **Test:** Before concluding your task, review the HTML/CSS changes you made. Mentally verify them against the constraints above.
- **Fix:** If your additions affect existing elements (e.g. contrast is broken by a new background color), you must proactively fix the affected elements.
- **Isolate:** Ensure your changes do not inadvertently break accessibility in unrelated parts of the application.