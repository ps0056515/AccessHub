import os
import re

def audit_directory(src_path):
    print("=== Keyboard Accessibility Audit ===")
    
    # Patterns
    # Find onClick on div, span, li, p, img, svg
    # Note: simple regex, might have false positives/negatives with multiline
    
    files_to_check = []
    for root, dirs, files in os.walk(src_path):
        for f in files:
            if f.endswith('.jsx') or f.endswith('.css'):
                files_to_check.append(os.path.join(root, f))
                
    for filepath in files_to_check:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
            if filepath.endswith('.css'):
                for i, line in enumerate(lines):
                    if 'outline: none' in line or 'outline: 0' in line:
                        print(f"[{filepath}:{i+1}] Outline none found: {line.strip()}")
            
            if filepath.endswith('.jsx'):
                # Check for positive tabIndex
                for i, line in enumerate(lines):
                    if re.search(r'tabIndex=\{?[1-9]', line):
                        print(f"[{filepath}:{i+1}] Positive tabIndex found: {line.strip()}")
                    if re.search(r'<a\s+[^>]*onClick[^>]*>', line) and 'href' not in line:
                        print(f"[{filepath}:{i+1}] Anchor with onClick but no href on same line: {line.strip()}")
                
                # Check for onClick without onKeyDown in the whole file
                # If a file has onClick but no onKeyDown, flag it
                # if 'onClick' in content and 'onKeyDown' not in content and 'onKeyUp' not in content:
                #    print(f"[{filepath}] Has onClick but no keyboard handlers.")
                
                # Let's find multiline divs with onClick
                divs_with_onclick = re.finditer(r'<(div|span|li|article|section)[^>]*onClick[^>]*>', content, re.IGNORECASE | re.DOTALL)
                for m in divs_with_onclick:
                    tag = m.group(0)
                    if 'role="button"' not in tag and 'role="tab"' not in tag and 'role="menuitem"' not in tag and 'role="link"' not in tag and 'role="checkbox"' not in tag and 'role="switch"' not in tag:
                         # We'll just print them and we can review
                         # extract a short snippet
                         snippet = tag[:80].replace('\n', ' ')
                         print(f"[{filepath}] Non-interactive element with onClick (no role?): {snippet}")
                    elif 'onKeyDown' not in tag and 'onKeyUp' not in tag and 'onKeyPress' not in tag:
                         snippet = tag[:80].replace('\n', ' ')
                         print(f"[{filepath}] Element with onClick but no keyboard handler in same tag: {snippet}")

audit_directory('src')
