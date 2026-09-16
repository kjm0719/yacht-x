import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || `${window.location.protocol}//${window.location.hostname}:3001`;

let sessionId: string = localStorage.getItem('yacht_session_id') || '';
if (!sessionId) {
  sessionId = uuidv4();
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
