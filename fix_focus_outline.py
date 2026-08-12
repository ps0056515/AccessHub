
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
            # Replace box-shadow focus rings with outline to prevent clipping
            new_content = re.sub(
                r"box-shadow:\s*0\s+0\s+0\s+2px\s+var\(--bg\),\s*0\s+0\s+0\s+4px\s+var\(--accent\);",
                "outline: 2px solid var(--accent); outline-offset: 2px; box-shadow: none;",
                new_content
            )

            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Fixed {filepath}")

