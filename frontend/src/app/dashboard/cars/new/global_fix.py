import os
import re

def fix_step_syntax(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace (currentStep === X || showAllSteps) && ( ... )
    # with (currentStep === X || showAllSteps) && ... }
    # This removes the redundant parenthesis that might be confusing Turbopack
    
    # 1. Remove the ( at the start of step conditionals
    content = re.sub(r'\{\(currentStep === (\d) \|\| showAllSteps\) && \(', r'{(currentStep === \1 || showAllSteps) &&', content)
    
    # 2. Find the end of these sections and change )} to }
    # We look for </section>\s+)}
    # But only if the step conditional was matched.
    content = re.sub(r'</section>\s+\)\}', r'</section>\n          }', content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixing new/page.tsx")
fix_step_syntax(r'g:\carental\frontend\src\app\dashboard\cars\new\page.tsx')
print("Fixing edit/[id]/page.tsx")
fix_step_syntax(r'g:\carental\frontend\src\app\dashboard\cars\edit\[id]\page.tsx')
