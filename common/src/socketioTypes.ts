import { Server, Socket } from 'socket.io';
import { Socket as ClientSocket } from 'socket.io-client';
import { SettableOptions, VisibleOptions } from './options';
import {
  Player,
  PollName,
  Match,
  MidgameConnectData,
  Responses,
  SelectionType,
  Score,
  PollVoteCount
} from './stateTypes';
import { Result } from './result';

interface ServerToClientRoomEvents {
  joinRoom(args: { error: string } | { success: boolean; roomName: string }): void;

  updatePlayers(args: { modifies: Player[]; deletes: string[] }): void;

  kickPlayer(data: { error: string }): void;
}

interface ClientToServerRoomEvents {
  createRoom(name: string, roomName: string, langs?: readonly string[]): void;

  joinRoom(name: string, roomName: string): void;
}

interface ServerToClientGameEvents {
  setOptions(options: Partial<VisibleOptions>): void;

  beginPrompt(prompt: string): void;

  promptResponse(response: string): void;

  nextSelection(args: { selector: string; selectionType: SelectionType }): void;

  setVoteCount(args: PollVoteCount): void;

  selectionTypeChosen(selectionType: SelectionType): void;

  beginMatching(selectedResponse: string): void;

  matchesFound(matches: Match[]): void;

  endRound(args: { hasNextRound: boolean }): void;

  gameOver(results: Score[]): void;

  midgameConnect(reconnect: MidgameConnectData): void;
}

interface ClientToServerGameEvents {
  setOptions(options: Partial<SettableOptions>, callback?: (p: { success: boolean }) => void): void;

  startGame(): void;

  pollVote(pollName: PollName): void;

  promptResponse(response: string): void;

  selectSelectionType(isStrike: boolean): void;

  selectResponse(response: string): void;

  selectMatch(match: string): void;

  selectionComplete(): void;

  getResponses(id: string, callback: (data: Result<Responses>) => void): void;
}

type ServerToClientEvents = ServerToClientRoomEvents & ServerToClientGameEvents;
type ClientToServerEvents = ClientToServerRoomEvents & ClientToServerGameEvents;

export class TypedServer extends Server<ClientToServerEvents, ServerToClientEvents> {}

export class TypedSocket extends Socket<ClientToServerEvents, ServerToClientEvents> {}
export class TypedClientSocket extends ClientSocket<ServerToClientEvents, ClientToServerEvents> {}
