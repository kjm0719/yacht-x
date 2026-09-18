import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || `${window.location.protocol}//${window.location.hostname}:3001`;

const getUUID = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36));

let sessionId: string = localStorage.getItem('yacht_session_id') || '';
if (!sessionId) {
  sessionId = getUUID();
  localStorage.setItem('yacht_session_id', sessionId);
}
export { sessionId };

export const socket: Socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  auth: {
    sessionId,
  },
});
