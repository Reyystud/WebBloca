import os
import re

files_to_update = [
    "/home/orion/Bloca/WebBloca/parse_products.py",
    "/home/orion/Bloca/WebBloca/components/brand-story.tsx",
    "/home/orion/Bloca/WebBloca/lib/products.ts",
    "/home/orion/Bloca/WebBloca/prisma/seed.ts"
]

pattern = re.compile(r"(Catalog/Restock/BonClaire|Catalog/Restock/Wicky|Catalog/Restock/Bub|Catalog/Buggle|Model)/([^'\"<>]+?)\.(?:jpg|jpeg|JPG|JPEG)")

for file_path in files_to_update:
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}, does not exist.")
        continue
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    new_content, count = pattern.subn(r"\1/\2.webp", content)
    
    if count > 0:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {count} occurrences in {file_path}")
    else:
        print(f"No occurrences found in {file_path}")
