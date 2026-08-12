import os
import re

views_dir = r"C:\Users\User\Desktop\all_can_access\AccessHub\src\pages\admin\views"

for root, dirs, files in os.walk(views_dir):
    for file in files:
        if file.endswith(".jsx"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            new_content = content
            
            # 1. Add id="admin-search-input" to the main search inputs
            new_content = re.sub(
                r"(<input[^>]*placeholder=[\"']Search[^\"']*[\"'][^>]*?)(/?>)",
                r"\1 id=\"admin-search-input\" \2",
                new_content
            )

            # 2. Add focus restoration to handleBulkDelete
            new_content = re.sub(
                r"(setSelectedIds\(\[\]\);?\s*(\n\s*await [a-zA-Z0-9_]+\(.*?\);?)?\s*\} catch \(err\) \{)",
                r"\1\n      setTimeout(() => document.getElementById(\"admin-search-input\")?.focus(), 0);\n    } catch (err) {",
                new_content
            )

            # 3. Add focus restoration to handleBulkPublish / Unpublish
            new_content = re.sub(
                r"(setSelectedIds\(\[\]\);?\s*(\n\s*await [a-zA-Z0-9_]+\(.*?\);?)?\s*\} catch \(err\) \{)",
                r"\1\n      setTimeout(() => document.getElementById(\"admin-search-input\")?.focus(), 0);\n    } catch (err) {",
                new_content
            )

            # 4. Add focus restoration to handleDelete (single delete)
            # Find the showToast?('...', 'success'); line inside handleDelete
            new_content = re.sub(
                r"(showToast\?\.?\([^\)]+\);\s*(\n\s*await [a-zA-Z0-9_]+\(.*?\);?)?\s*\n?\s*\} catch \(err\) \{)",
                r"\1\n      setTimeout(() => document.getElementById(\"admin-search-input\")?.focus(), 0);\n    } catch (err) {",
                new_content
            )

            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Fixed {filepath}")
