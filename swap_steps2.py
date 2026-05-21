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

    # Find section location-module and change to currentStep === 5
    content = re.sub(
        r'\{\(currentStep === 4 \|\| showAllSteps\)\s*&&\s*\(\s*<section id="location-module"',
        r'{(currentStep === 5 || showAllSteps) && (\n            <section id="location-module"',
        content
    )

    # Find section pricing-module and change to currentStep === 4
    content = re.sub(
        r'\{\(currentStep === 5 \|\| showAllSteps\)\s*&&\s*\(\s*<section id="pricing-module"',
        r'{(currentStep === 4 || showAllSteps) && (\n            <section id="pricing-module"',
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
