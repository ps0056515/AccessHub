import os
import re

views_dir = r"C:\Users\User\Desktop\all_can_access\AccessHub\src\pages\admin\views"

for root, dirs, files in os.walk(views_dir):
    for file in files:
        if file.endswith(".jsx"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            new_content = re.sub(r"\s*outline:\s*['\"]none['\"],?", "", content)

            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Fixed {filepath}")
