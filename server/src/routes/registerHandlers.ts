import { Server, Socket } from 'socket.io';
import { registerRoomHandlers } from './roomHandlers';
import { registerGameHandlers } from './gameHandlers';

export function registerHandlers(io: Server, socket: Socket) {
  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);
}
