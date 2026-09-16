import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  if (socket) return socket;

  const token = useAuthStore.getState().accessToken;
  if (!token) return null;

  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
  
  socket = io(baseUrl, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
