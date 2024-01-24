import { roomService } from '../state/rooms';
import logger from '../logger/logger';
import type { TypedServer } from ':common/socketioTypes';
// 1 minute
const TIMEOUT = 60 * 1000;
// 1 second
//const TIMEOUT = 1000;
// 30 minutes
const MAX_INACTIVITY = 30 * 60 * 1000;
// 30 seconds
//const MAX_INACTIVITY = 30 * 1000;

export function startCleanupLoop(io: TypedServer): void {
  setInterval(() => cleanup(io), TIMEOUT);
}

function cleanup(io: TypedServer) {
  const inactiveRoomNames = roomService(MAX_INACTIVITY);
  for (const name of inactiveRoomNames) {
    logger.info('(roomService) Room closed due to inactivity');
    // send a kick event to all the players in that room
    io.to(name).emit('kickPlayer', { error: 'inactiveRoom' });
    io.in(name).socketsLeave(name);
  }
}
