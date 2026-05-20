import os

path = r'g:\carental\frontend\src\app\dashboard\cars\edit\[id]\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open(path, 'w', encoding='utf-8') as f:
    for line in lines:
        if '{(currentStep === 5 || showAllSteps) &&' in line and not '(' in line.split('&&')[1]:
            f.write(line.replace('&&', '&& ('))
        elif '</section>' in line and line.strip() == '</section>':
            # This is risky, but let's see. 
            # Actually, let's just fix the specific lines 615 and 941.
            f.write(line)
        else:
            f.write(line)

# Wait, I'll just do it properly.
lines[614] = lines[614].rstrip() + " (\n"
lines[940] = "                )}\n"

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
