"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { BACKEND_URL } from '@/config/api';
import { authService } from '@/services/authService';
import { useToast } from './Toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect if we have an active user or an admin user
    const adminUser = authService.getAdminUser();
    const regularUserId = user?._id || user?.id;
    const adminUserId = adminUser?._id;
    
    // Create an array of active IDs, filtering out null/undefined
    const activeIds = [regularUserId, adminUserId].filter(Boolean);
    
    if (activeIds.length > 0) {
      // Use origin and dynamic path to handle proxy prefixes (like /backend)
      const url = new URL(BACKEND_URL);
      const pathPrefix = url.pathname === '/' ? '' : url.pathname;
      
      const newSocket = io(url.origin, {
        path: `${pathPrefix}/socket.io`,
        query: { userId: activeIds.join(',') }, // Send both IDs comma-separated
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      const isTargetedForCurrentView = (targetUserId?: string) => {
        console.log("isTargetedForCurrentView CHECK:", { targetUserId, regularUserId, adminUserId, isAdminPath: window.location.pathname.startsWith('/admin') });
        // TEMP: Allow all for debugging
        return true; 
      };

      newSocket.on('new_notification', (data) => {
        console.log('New Platform Notification:', data);
        // Toast is handled by Header.tsx
      });

      // Listen for booking notifications
      newSocket.on('new_booking', (data) => {
        if (!isTargetedForCurrentView(data.targetUserId)) return;
        console.log('New Booking Notification:', data);
        showToast(data.message, 'success');
      });

      newSocket.on('booking_approved', (data) => {
        if (!isTargetedForCurrentView(data.targetUserId)) return;
        showToast(data.message, 'success');
      });

      newSocket.on('booking_rejected', (data) => {
        if (!isTargetedForCurrentView(data.targetUserId)) return;
        showToast(data.message, 'error');
      });

      newSocket.on('booking_cancelled_by_vendor', (data) => {
        if (!isTargetedForCurrentView(data.targetUserId)) return;
        showToast(data.message, 'error');
      });

      newSocket.on('booking_expired', (data) => {
        if (!isTargetedForCurrentView(data.targetUserId)) return;
        showToast(data.message, 'info');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user?._id, showToast]);

  const contextValue = React.useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
