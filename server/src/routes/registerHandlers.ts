import { registerRoomHandlers } from './roomHandlers';
import { registerGameHandlers } from './gameHandlers';
import { TypedServer, TypedSocket } from '../types/socketServerTypes';

export function registerHandlers(io: TypedServer, socket: TypedSocket) {
  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);
}
