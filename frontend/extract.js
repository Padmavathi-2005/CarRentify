const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\SAI\\.gemini\\antigravity-ide\\brain\\8f56d12e-0f9e-47d3-814b-adea76569bad\\.system_generated\\logs\\transcript.jsonl', 'utf-8').split('\n');
let allCode = [];
for (let line of lines) {
  if (!line || !line.includes('HomeView.tsx')) continue;
  try {
    const obj = JSON.parse(line);
    let output = null;
    
    // Pattern 1: obj.content directly
    if (obj.content && obj.content.includes('File Path: `file:///g:/carental/frontend/src/views/HomeView.tsx`')) {
      output = obj.content;
    } 
    // Pattern 2: obj.tool_responses
    else if (obj.type === 'TOOL_RESPONSE' && obj.tool_responses) {
      for (let res of obj.tool_responses) {
         if (res.response && res.response.output && res.response.output.includes('File Path: `file:///g:/carental/frontend/src/views/HomeView.tsx`')) {
            output = res.response.output;
         }
      }
    }
    
    if (output) {
      const txtLines = output.split('\n');
      for (let tl of txtLines) {
        const match = tl.match(/^(\d+):\s(.*)/);
        if (match) {
          const lineNum = parseInt(match[1]);
          allCode[lineNum - 1] = match[2];
        }
      }
    }
  } catch(e) {}
}

const finalCode = allCode.join('\n');
fs.writeFileSync('restored_HomeView.tsx', finalCode);
console.log('Total restored lines: ' + allCode.filter(x => x !== undefined).length);
