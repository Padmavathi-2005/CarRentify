import os
import re

files = [
    'frontend/src/app/admin/cars/new/page.tsx',
    'frontend/src/app/admin/cars/edit/[id]/page.tsx',
    'frontend/src/app/dashboard/cars/new/page.tsx',
    'frontend/src/app/dashboard/cars/edit/[id]/page.tsx'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    loc_pattern = r'(\{\(currentStep === 5 \|\| showAllSteps\)\s*&&\s*\(\s*<section id="location-module".*?)(?=\{\(currentStep === 4 \|\| showAllSteps\)\s*&&\s*\(\s*<section id="pricing-module")'
    loc_match = re.search(loc_pattern, content, flags=re.DOTALL)
    
    if loc_match:
        loc_block = loc_match.group(1)
        
        pricing_pattern = r'(\{\(currentStep === 4 \|\| showAllSteps\)\s*&&\s*\(\s*<section id="pricing-module".*?)(?=\{\(currentStep === 6 \|\| showAllSteps\)\s*&&\s*\(\s*<section id="seo-config")'
        pricing_match = re.search(pricing_pattern, content, flags=re.DOTALL)
        
        if pricing_match:
            pricing_block = pricing_match.group(1)
            
            content = content.replace(loc_block + pricing_block, pricing_block + loc_block)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Swapped blocks in {filepath}")
        else:
            print(f"Could not find pricing block in {filepath}")
    else:
        print(f"Could not find location block in {filepath}")
