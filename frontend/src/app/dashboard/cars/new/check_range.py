import os

def count_brackets(path, start, end):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    curly = 0
    paren = 0
    for i in range(start-1, end):
        line = lines[i]
        for char in line:
            if char == '{': curly += 1
            elif char == '}': curly -= 1
            elif char == '(': paren += 1
            elif char == ')': paren -= 1
        
        if curly < 0:
            print(f"Excess }} at line {i+1}")
            curly = 0
        if paren < 0:
            print(f"Excess ) at line {i+1}")
            paren = 0
            
    print(f"Final for range {start}-{end}: curly={curly}, paren={paren}")

print("Checking new/page.tsx range 784-1031")
count_brackets(r'g:\carental\frontend\src\app\dashboard\cars\new\page.tsx', 784, 1031)
