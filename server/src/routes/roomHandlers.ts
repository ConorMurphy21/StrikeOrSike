import Joi from 'joi';
import {
  createRoom,
  disconnectPlayer,
  getRoomById,
  getRoomByName,
  joinRoom
} from '../models/rooms';
import logger from '../logger/logger';
import { midgameJoin } from './gameHandlers';
import { Server, Socket } from 'socket.io';

/*** handler validation schemas ***/
const roomSchema = Joi.object({
  name: Joi.string().allow(''),
  roomName: Joi.string().allow(''),
  langs: Joi.array().items(Joi.string().min(2).max(5))
}).required();

export function registerRoomHandlers(io: Server, socket: Socket): void {
  socket.onAny(() => {
    // update activity
    const room = getRoomById(socket.id);
    if (room) {
      room.lastActivity = new Date().getTime();
    }
  });

  /*** CONNECTION AND ROOM CREATION ***/
  socket.on('createRoom', (name: string, roomName: string, langs: string) => {
    // disconnect for cleanup
    disconnect(socket);

    const validateResult = roomSchema.validate({ name, roomName, langs });
    if (validateResult.error) return;

    const result = createRoom(socket.id, name, roomName, langs);
    // store name in session variable
    if ('error' in result) {
      logger.info(`(roomHandlers) Room creation failed due to ${result.error}`);
      socket.emit('joinRoom', { error: result.error });
    } else {
      logger.info('(roomHandlers) Room created');
      const room = result.room;
      socket.join(room.name);
      socket.emit('joinRoom', { success: true, roomName: room.name });
      socket.emit('updatePlayers', { modifies: room.players, deletes: [] });
      socket.emit('setOptions', room.state!.getOptions());
    }
  });

  socket.on('joinRoom', (name: string, roomName: string) => {
    // disconnect for cleanup
    disconnect(socket);

    const validateResult = roomSchema.validate({ name, roomName, langs: [] });
    if (validateResult.error) return;

    const result = joinRoom(socket.id, name, roomName);
    if ('error' in result) {
      logger.info(
        `(roomHandlers) Player failed to join room due to ${result.error}`
      );
      socket.emit('joinRoom', { error: result.error });
    } else {
      logger.info('(roomHandlers) Player joined room');
      const room = result.room;
      socket.join(room.name);
      socket.emit('joinRoom', { success: true, roomName: room.name });
      socket.emit('updatePlayers', { modifies: room.players, deletes: [] });
      socket.to(room.name).emit('updatePlayers', {
        modifies: [room.players.find((p) => p.name === name)],
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

function disconnect(socket: Socket): void {
  const roomName = getRoomById(socket.id)?.name;
  disconnectPlayer(socket.id);
  // remove socket from room
  if (roomName) {
    socket.leave(roomName);
    logger.info('(roomHandlers) player disconnected from room');
  }

  const room = getRoomByName(roomName);
  if (room) {
    const player = room.players.find((p) => p.id === socket.id);
    // could be modified
    const leader = room.players.find((p) => p.leader);
    socket
      .to(room.name)
      .emit('updatePlayers', { modifies: [player, leader], deletes: [] });
  }
}
