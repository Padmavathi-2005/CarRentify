const fs = require('fs');

const socketFile = 'g:/carental/frontend/src/components/SocketProvider.tsx';
let content = fs.readFileSync(socketFile, 'utf8');

content = content.replace(
  `query: { userId: activeIds.join(',') }, // Send both IDs comma-separated
        transports: ['websocket', 'polling'],`,
  `query: { userId: activeIds.join(',') }, // Send both IDs comma-separated
        transports: ['websocket', 'polling'],
        forceNew: true, // Force a new connection so it doesn't conflict with chatService`
);

fs.writeFileSync(socketFile, content, 'utf8');
console.log('Added forceNew: true to SocketProvider.tsx');
