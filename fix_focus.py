
import os
import re

src_dir = r"C:\Users\User\Desktop\all_can_access\AccessHub\src"

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(".css"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            new_content = content
            # Replace box-shadow: 0 0 0 3px var(--accent-border-interactive)
            new_content = re.sub(
                r"box-shadow:\s*0\s+0\s+0\s+3px\s+var\(--accent-border-interactive\);",
                "box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);",
                new_content
            )
            # Replace rgba(var(--accent-rgb), 0.15) or 0.12 in box-shadow
            new_content = re.sub(
                r"box-shadow:\s*0\s+0\s+0\s+3px\s+rgba\(var\(--accent-rgb\),\s*0\.1[25]\);",
                "box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);",
                new_content
            )

            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Fixed {filepath}")

