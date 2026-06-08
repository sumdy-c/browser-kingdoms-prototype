import { io, Socket } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const socket: Socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  autoConnect: false,
});
