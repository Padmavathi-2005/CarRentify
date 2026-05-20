import os
import re

def fix_step_syntax(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Wrap step content in fragments to be safe
    # Replace:
    # {(condition) &&
    #   <section> ... </section>
    # }
    # with:
    # {condition && (
    #   <>
    #     <section> ... </section>
    #   </>
    # )}
    
    # 1. Standardize start
    content = re.sub(r'\{\(currentStep === (\d) \|\| showAllSteps\) &&', r'{(currentStep === \1 || showAllSteps) && (\n            <>', content)
    
    # 2. Standardize end
    content = re.sub(r'</section>\s+\}', r'</section>\n            </>\n          )}', content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixing new/page.tsx")
fix_step_syntax(r'g:\carental\frontend\src\app\dashboard\cars\new\page.tsx')
print("Fixing edit/[id]/page.tsx")
fix_step_syntax(r'g:\carental\frontend\src\app\dashboard\cars\edit\[id]\page.tsx')
