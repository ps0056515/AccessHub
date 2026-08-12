import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

for root, _, files in os.walk('src'):
    for f in files:
        if f.endswith('.css'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
                if 'outline: none' in content or 'outline: 0' in content:
                    print(f"
--- {path} ---")
                    blocks = re.split(r'\}', content)
                    for block in blocks:
                        if 'outline: none' in block or 'outline: 0' in block:
                            print(block.strip() + "}")
