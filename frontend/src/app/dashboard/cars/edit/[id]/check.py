def check_balance(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        for char in line:
            if char == '{':
                stack.append(('{', i+1))
            elif char == '}':
                if not stack:
                    print(f"Extra }} at line {i+1}")
                else:
                    stack.pop()
    
    if stack:
        for s, l in stack:
            print(f"Unclosed {s} starting at line {l}")

print("Checking new/page.tsx:")
check_balance(r'g:\carental\frontend\src\app\dashboard\cars\new\page.tsx')
print("\nChecking edit/[id]/page.tsx:")
check_balance(r'g:\carental\frontend\src\app\dashboard\cars\edit\[id]\page.tsx')
