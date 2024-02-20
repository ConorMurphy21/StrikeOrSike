import { VisibleOptions } from './options';
import { z } from 'zod';

export type Player = {
  id: string;
  name: string;
  leader: boolean;
  active: boolean;
};

export type Stage = 'lobby' | 'response' | 'selection' | 'matching' | 'endRound';

export type SelectionType = 'strike' | 'sike' | 'choice';

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

export type Score = {
  player: string;
  points: number;
};

export type VoteCount = {
  count: number;
  next: boolean;
};

export type PollVoteCount = { pollName: PollName } & VoteCount;

export const zPollName = z.enum(['skipPrompt', 'startNextRound', 'sikeDispute']);
export type PollName = z.infer<typeof zPollName>;

export type MidgameConnectData = {
  id: string;
  stage: Stage;
  selectionType: SelectionType;
  responses: Responses;
  selector: string;
  selectedResponse: string;
  prompt: string;
  options: VisibleOptions;
  timer: number;
  matches: Match[];
  voteCounts: Record<PollName, { count: number; next: boolean }>;
};
