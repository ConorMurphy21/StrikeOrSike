import { createRoom, disconnectPlayer, getRoomById, getRoomByName, joinRoom } from '../state/rooms';
import logger from '../logger/logger';
import { midgameJoin } from './gameHandlers';
import { isErr } from ':common/result';
import { z } from 'zod';
import type { TypedServer, TypedSocket } from ':common/socketioTypes';

/*** handler validation schemas ***/
const roomSchema = z.object({
  name: z.string(),
  roomName: z.string(),
  langs: z.array(z.string().min(2).max(5)).optional()
});

export function registerRoomHandlers(io: TypedServer, socket: TypedSocket): void {
  socket.onAny(() => {
    // update activity
    const room = getRoomById(socket.id);
    if (room) {
      room.lastActivity = new Date().getTime();
    }
  });

  /*** CONNECTION AND ROOM CREATION ***/
  socket.on('createRoom', (name: string, roomName: string, langs?: readonly string[]) => {
    // disconnect for cleanup
    disconnect(socket);

    const validateResult = roomSchema.safeParse({ name, roomName, langs });
    if (!validateResult.success) {
      logger.warn(`(roomHandlers) Missing handling for room creation: ${validateResult.error.message}`);
      return;
    }
    ({ name, roomName, langs } = validateResult.data);
    const result = createRoom(socket.id, name, roomName, langs);
    // stores name in session variable
    if (isErr(result)) {
      logger.log(result.wrap('(roomHandlers) Room creation failed due to %1$s'));
      socket.emit('joinRoom', { error: result.message });
    } else {
      logger.info('(roomHandlers) Room created');
      const room = result.room;
      void socket.join(room.name);
      socket.emit('joinRoom', { success: true, roomName: room.name });
      socket.emit('updatePlayers', { modifies: room.players, deletes: [] });
      socket.emit('setOptions', room.state!.getOptions());
    }
  });

  socket.on('joinRoom', (name: string, roomName: string) => {
    // disconnect for cleanup
    disconnect(socket);

    const validateResult = roomSchema.safeParse({ name, roomName, langs: [] });
    if (!validateResult.success) return;
    ({ name, roomName } = validateResult.data);

    const result = joinRoom(socket.id, name, roomName);
    if (isErr(result)) {
      logger.log(result.wrap('(roomHandlers) Player failed to join room due to %1$s'));
      socket.emit('joinRoom', { error: result.message });
    } else {
      logger.info('(roomHandlers) Player joined room');
      const room = result.room;
      void socket.join(room.name);
      socket.emit('joinRoom', { success: true, roomName: room.name });
      socket.emit('updatePlayers', { modifies: room.players, deletes: [] });
      socket.to(room.name).emit('updatePlayers', {
        modifies: [room.players.find((p) => p.name === name)!],
        deletes: []
      });
      socket.emit('setOptions', room.state!.getOptions());
      if (room.state!.stage !== 'lobby') {
        midgameJoin(socket, room, result.oldId);
      }
    }
  });

  socket.on('disconnect', (): void => {
    disconnect(socket);
  });
}

function disconnect(socket: TypedSocket): void {
  const roomName = getRoomById(socket.id)?.name;
  disconnectPlayer(socket.id);
  // remove socket from room
  if (roomName) {
    void socket.leave(roomName);
    logger.info('(roomHandlers) player disconnected from room');
  }

  const room = getRoomByName(roomName);
  if (room) {
    // may be undefined if player was deleted instead of set to inactive
    const player = room.players.find((p) => p.id === socket.id);

    // could be modified
    // safe because if there was no leader then there would be no room
    const leader = room.players.find((p) => p.leader)!;

    const modifies = [leader];
    const deletes: string[] = [];

    // add player to modifies or deletes depending on if they exist or not
    if (player !== undefined) {
      modifies.push(player);
    } else {
      deletes.push(socket.id);
    }
    socket.to(room.name).emit('updatePlayers', { modifies: modifies, deletes: deletes });
  }
}
