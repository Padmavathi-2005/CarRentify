const fs = require('fs');
const content = fs.readFileSync('g:/carental/frontend/src/admin/views/AdminCouponsView.tsx', 'utf8');

// We isolate the second return block (from line 291 to end of file)
const lines = content.split(/\r?\n/);
const secondReturnLines = lines.slice(291); // 0-indexed

let openTags = [];
const tagRegex = /<(\/)?([a-zA-Z0-9\.\:-]+)([^>]*?)>/g;

for (let i = 0; i < secondReturnLines.length; i++) {
  const line = secondReturnLines[i];
  const lineNum = 292 + i; // 1-indexed
  
  // Skip comments
  if (line.trim().startsWith('{/*') || line.trim().startsWith('//')) {
    continue;
  }
  
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    const isClose = !!match[1];
    const tagName = match[2];
    const isSelfClosing = match[3].endsWith('/') || tagName === 'input' || tagName === 'Input' || tagName === 'select' || tagName === 'img' || tagName === 'button' && match[3].includes('onClick') && !line.includes('</button>') && !line.includes('</Button>'); // rough approximation
    
    // Fine-tune self closing for common tags
    if (tagName === 'Input' || tagName === 'input' || tagName === 'select' || tagName === 'img' || tagName === 'hr' || tagName === 'br') {
      continue;
    }
    
    // Ignore Lucide icon tags since they are self-closing (e.g. <Plus />, <Search />)
    if (['Plus', 'Search', 'RefreshCw', 'Ticket', 'ShoppingBag', 'Edit3', 'Clock', 'ChevronRight', 'Tag', 'Percent', 'DollarSign', 'CalendarIcon', 'AlertCircle', 'ShieldCheck', 'Globe', 'Info'].includes(tagName)) {
      continue;
    }

    if (isClose) {
      if (openTags.length === 0) {
        console.log(`[Line ${lineNum}] Error: Closed tag </${tagName}> but no tags were open.`);
      } else {
        const lastOpen = openTags.pop();
        if (lastOpen.name !== tagName) {
          console.log(`[Line ${lineNum}] Warning: Closed tag </${tagName}> but expected </${lastOpen.name}> (opened on Line ${lastOpen.line})`);
        }
      }
    } else {
      // Check if self-closing
      if (match[3].trim().endsWith('/')) {
        continue;
      }
      openTags.push({ name: tagName, line: lineNum });
    }
  }
}

console.log('Remaining Open Tags:', openTags);
