import sys

def check_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    curly = 0
    paren = 0
    in_jsx = False
    
    for i, line in enumerate(lines):
        for char in line:
            if char == '{': curly += 1
            if char == '}': curly -= 1
            if char == '(': paren += 1
            if char == ')': paren -= 1
        
        if curly < 0 or paren < 0:
            print(f"Error at line {i+1}: curly={curly}, paren={paren}")
            # Reset to avoid cascade
            if curly < 0: curly = 0
            if paren < 0: paren = 0
            
    print(f"Final: curly={curly}, paren={paren}")

print("Checking new/page.tsx")
check_file(r'g:\carental\frontend\src\app\dashboard\cars\new\page.tsx')
