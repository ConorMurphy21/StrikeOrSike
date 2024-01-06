import { ConfigurableOptions } from '../state/options';
import { PollName } from '../state/pollService';

export enum Stage {
  Lobby = 'lobby',
  Response = 'response',
  Selection = 'selection',
  Matching = 'matching',
  EndRound = 'endRound'
}

export enum SelectionType {
  Strike = 'strike',
  Sike = 'sike',
  Choice = 'choice'
}

export type Match = {
  player: string;
  response: string;
  exact: boolean;
};

export type Responses = {
  id: string;
  all: string[];
  used: string[];
  selectedStrike: string;
  selectedSike: string;
};

export type MidgameConnectData = {
  id: string;
  stage: Stage;
  selectionType: SelectionType;
  responses: Responses;
  selector: string;
  selectedResponse: string;
  prompt: string;
  options: ConfigurableOptions;
  timer: number;
  matches: Match[];
  voteCounts: Record<PollName, { count: number; next: boolean }>;
};
