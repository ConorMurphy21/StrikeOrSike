import { registerRoomHandlers } from './roomHandlers';
import { registerGameHandlers } from './gameHandlers';
import type { TypedServer, TypedSocket } from ':common/socketioTypes';

export function registerHandlers(io: TypedServer, socket: TypedSocket) {
  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);
}
