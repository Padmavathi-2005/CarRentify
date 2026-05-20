import os

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Standardize Step 5
    # Find the block starting with (currentStep === 5 || showAllSteps)
    start_marker = '{(currentStep === 5 || showAllSteps) && ('
    end_marker = ')}'
    
    # Actually, let's just replace the specific broken lines.
    # We'll use line numbers from the last view_file.
    lines = content.split('\n')
    
    # Find the Pricing section start
    pricing_start = -1
    for i, line in enumerate(lines):
        if '{(currentStep === 5 || showAllSteps)' in line:
            pricing_start = i
            break
            
    if pricing_start != -1:
        # Check if it has (
        if '&& (' not in lines[pricing_start]:
            lines[pricing_start] = lines[pricing_start].replace('&&', '&& (')
        
        # Find its section end
        section_end = -1
        for i in range(pricing_start, len(lines)):
            if '</section>' in lines[i]:
                # Look for the closing bracket in the next few lines
                for j in range(i+1, i+5):
                    if ')}' in lines[j] or '}' in lines[j]:
                        section_end = j
                        break
                if section_end != -1: break
        
        if section_end != -1:
            lines[section_end] = '          )}'

    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

print("Fixing new/page.tsx")
fix_file(r'g:\carental\frontend\src\app\dashboard\cars\new\page.tsx')
print("Fixing edit/[id]/page.tsx")
fix_file(r'g:\carental\frontend\src\app\dashboard\cars\edit\[id]\page.tsx')
