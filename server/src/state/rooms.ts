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
  playerId: string,
  playerName: string,
  roomName: string,
  langs?: readonly string[]
): Result<{ room: Room }> {
  let result = isValidName(playerName);
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
        id: playerId,
        name: playerName,
        leader: true,
        active: true
      }
    ],
    state: null
  };
  room.state = new GameState(room);
  rooms[roomName] = room;
  playerRoom[playerId] = room;
  return Ok({ room });
}

export function joinRoom(
  playerId: string,
  playerName: string,
  roomName: string
): Result<{ room: Room; oldId?: string }> {
  const result = isValidName(playerName);
  if (isErr(result)) return result;
  const room = rooms[parameterize(roomName)];
  if (!room) return Info('noRoom');
  // don't hold spots for inactive players
  const activePlayers = room.players.filter((p) => p.active);
  if (activePlayers.length >= room.state!.options.maxPlayers) {
    return Info('noSpace');
  }

  const existingPlayer = room.players.find((player) => player.name === playerName);
  if (existingPlayer && existingPlayer.active) {
    return Info('nameTaken');
  } else if (existingPlayer) {
    // if player disconnected, let them join back in as who they were previously
    const oldId = existingPlayer.id;
    playerRoom[playerId] = room;
    existingPlayer.active = true;
    existingPlayer.id = playerId;
    return Ok({ room, oldId });
  }

  room.players.push({
    id: playerId,
    name: playerName,
    leader: false,
    active: true
  });

  playerRoom[playerId] = room;
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
    if (room.state!.stage === 'lobby') {
      // remove player from room permanently if it's the lobby phase of the game
      // there is no state to save so rejoining and joining for the first time are identical
      // so this allows us to clean up some stale players
      room.players = room.players.filter((p: Player) => p.id !== id);
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
