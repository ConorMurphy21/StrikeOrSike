import { GameState } from './gameState';
import parameterize from 'parameterize';
import locale from 'locale';
import type { Result, VoidResult } from ':common/result';
import { Info, isErr, Ok, Success, Warn } from ':common/result';
import type { Player } from ':common/stateTypes';

export type Room = {
  name: string;
  lastActivity: number;
  lang: string;
  players: Player[];
  state: GameState | null;
};

const supportedLocales = new locale.Locales(['en-CA'], 'en-CA');

// map model to rooms
const playerRoom: Record<string, Room> = {};

// map rooms to model
const rooms: { [key: string]: Room } = {};

function isValidName(name: string): VoidResult {
  if (name.length < 2) return Warn('shortName');
  if (name.length > 20) return Warn('longName');
  return Success();
}

function isValidRoomName(name: string): VoidResult {
  if (name.length < 2) return Warn('shortRoomName');
  if (name.length > 15) return Warn('longRoomName');
  if (rooms[name]) return Info('roomTaken');
  return Success();
}

export function createRoom(
  id: string,
  name: string,
  roomName: string,
  langs?: readonly string[]
): Result<{ room: Room }> {
  let result = isValidName(name);
  if (isErr(result)) return result;
  roomName = parameterize(roomName);
  result = isValidRoomName(roomName);
  if (isErr(result)) return result;

  const locales = new locale.Locales(langs);

  // clone default room
  const room: Room = {
    name: roomName,
    lastActivity: new Date().getTime(),
    lang: locales.best(supportedLocales).code,
    players: [
      {
        id,
        name,
        leader: true,
        active: true
      }
    ],
    state: null
  };
  room.state = new GameState(room);
  rooms[roomName] = room;
  playerRoom[id] = room;
  return Ok({ room });
}

export function joinRoom(id: string, name: string, roomName: string): Result<{ room: Room; oldId?: string }> {
  const result = isValidName(name);
  if (isErr(result)) return result;
  const room = rooms[parameterize(roomName)];
  if (!room) return Info('noRoom');
  // don't hold spots for inactive players
  const activePlayers = room.players.filter((p) => p.active);
  if (activePlayers.length >= room.state!.options.maxPlayers) {
    return Info('noSpace');
  }

  const existingPlayer = room.players.find((player) => player.name === name);
  if (existingPlayer && existingPlayer.active) {
    return Info('nameTaken');
  } else if (existingPlayer) {
    // if player disconnected, let them join back in as who they were previously
    const oldId = existingPlayer.id;
    playerRoom[id] = room;
    existingPlayer.active = true;
    existingPlayer.id = id;
    return Ok({ room, oldId });
  }

  room.players.push({
    id,
    name,
    leader: false,
    active: true
  });

  playerRoom[id] = room;
  return Ok({ room });
}

export function getRoomByName(roomName: string): Room {
  return rooms[roomName];
}

export function getRoomById(id: string): Room {
  return playerRoom[id];
}

export function disconnectPlayer(id: string): void {
  const room = playerRoom[id];
  if (!room) return;
  delete playerRoom[id];
  const player = room.players.find((player) => player.id === id);
  if (player) {
    player.active = false;
  }
  // if no model are still active delete the room
  const activePlayer = room.players.find((player) => player.active);
  if (!activePlayer) {
    if (room.state!.promptTimeout) {
      clearTimeout(room.state!.promptTimeout);
    }
    delete rooms[room.name];
  } else {
    room.state!.disconnect(id);
    if (player && player.leader) {
      player.leader = false;
      activePlayer.leader = true;
    }
  }
}

// cleanup all data concerning inactive rooms
// return list of rooms removed
export function roomService(maxInactivity: number) {
  const time = new Date().getTime();

  const inactiveRooms = [];
  for (const name in rooms) {
    const room = rooms[name];
    if (time - room.lastActivity > maxInactivity) {
      inactiveRooms.push(name);
      if (room.state!.promptTimeout) {
        clearTimeout(room.state!.promptTimeout);
      }
      // delete the player record of the room
      for (const player of room.players) {
        delete playerRoom[player.id];
      }
    }
  }
  for (const name of inactiveRooms) {
    delete rooms[name];
  }

  return inactiveRooms;
}

export function getCount() {
  return {
    rooms: Object.keys(rooms).length,
    players: Object.keys(playerRoom).length
  };
}
