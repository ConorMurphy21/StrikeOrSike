import { Server, Socket } from 'socket.io';
import { ConfigurableOptions } from '../state/options';
import { PollName } from '../state/pollService';
import { Match, MidgameConnectData, Responses, SelectionType } from './stateTypes';
import { ApiResult, Result, ResultOk } from './result';
import { Player } from '../state/rooms';

interface ServerToClientRoomEvents {
  joinRoom(args: { error: string } | { success: boolean; roomName: string }): void;

  updatePlayers(args: { modifies: Player[]; deletes: Player[] }): void;
}

interface ClientToServerRoomEvents {
  createRoom(name: string, roomName: string, langs?: string[]): void;

  joinRoom(name: string, roomName: string): void;
}

interface ServerToClientGameEvents {
  setOptions(options: ConfigurableOptions): void;

  beginPrompt(prompt: string): void;

  promptResponse(response: string): void;

  nextSelection(args: { selector: string; selectionType: SelectionType }): void;

  setVoteCount(args: { pollName: PollName; count: number; next: boolean }): void;

  selectionTypeChosen(selectionType: SelectionType): void;

  beginMatching(selectedResponse: string): void;

  matchesFound(matches: Match[]): void;

  endRound(args: { hasNextRound: boolean }): void;

  gameOver(results: { player: string; points: number }[]): void;

  midgameConnect(reconnect: MidgameConnectData): void;
}

interface ClientToServerGameEvents {
  setOptions(options: ConfigurableOptions, callback?: (p: { success: boolean }) => void): void;

  startGame(): void;

  pollVote(pollName: PollName): void;

  promptResponse(response: string): void;

  selectSelectionType(isStrike: boolean): void;

  selectResponse(response: string): void;

  selectMatch(match: string): void;

  selectionComplete(): void;

  getResponses(
    id: string,
    callback: (
      result:
        | { error: string }
        | {
            success: boolean;
            responses: Responses;
          }
    ) => void
  ): void;
}

type ServerToClientEvents = ServerToClientRoomEvents & ServerToClientGameEvents;
type ClientToServerEvents = ClientToServerRoomEvents & ClientToServerGameEvents;

export class TypedServer extends Server<ClientToServerEvents, ServerToClientEvents> {}

export class TypedSocket extends Socket<ClientToServerEvents, ServerToClientEvents> {}
