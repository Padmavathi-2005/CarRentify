const fs = require('fs');

const socketFile = 'g:/carental/frontend/src/components/SocketProvider.tsx';
let content = fs.readFileSync(socketFile, 'utf8');

// Replace isTargetedForCurrentView to always return true and log
content = content.replace(
  `const isTargetedForCurrentView = (targetUserId?: string) => {
        if (!targetUserId) return true;
        const isAdminPath = window.location.pathname.startsWith('/admin');
        if (isAdminPath && targetUserId !== adminUserId) return false;
        if (!isAdminPath && targetUserId !== regularUserId) return false;
        return true;
      };`,
  `const isTargetedForCurrentView = (targetUserId?: string) => {
        console.log("isTargetedForCurrentView CHECK:", { targetUserId, regularUserId, adminUserId, isAdminPath: window.location.pathname.startsWith('/admin') });
        // TEMP: Allow all for debugging
        return true; 
      };`
);

// Remove duplicate new_notification toast in SocketProvider to avoid double toasts
content = content.replace(
  `      newSocket.on('new_notification', (data) => {
        if (!isTargetedForCurrentView(data.targetUserId)) return;
        console.log('New Platform Notification:', data);
        const msg = data.title && data.body ? \`🔔 \${data.title}: \${data.body}\` : (data.body || data.title);
        showToast(msg, 'info');
      });`,
  `      newSocket.on('new_notification', (data) => {
        console.log('New Platform Notification:', data);
        // Toast is handled by Header.tsx
      });`
);

fs.writeFileSync(socketFile, content, 'utf8');
console.log('Patched SocketProvider.tsx');
