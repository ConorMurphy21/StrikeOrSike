import type { GameState } from './gameState';
import type { Result } from ':common/result';
import { Err, Ok, Warn } from ':common/result';
import type { PollName, PollVoteCount, Stage } from ':common/stateTypes';
import logger from '../logger/logger';

type Poll = {
  stage: Stage;
  completeCb: () => void;
  majorityPercent: number;
  exclude: string | undefined;
  inFavor: string[];
};

export class PollService {
  private gameState: GameState;
  private readonly polls: Map<PollName, Poll>;
  private _pollVoteUpdateCb: null | ((pollVoteCounts: PollVoteCount) => void) = null;
  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.polls = new Map<PollName, Poll>();
  }

  registerPollVoteUpdateCb(cb: (pollVoteCounts: PollVoteCount) => void): void {
    this._pollVoteUpdateCb = cb;
  }

  registerPoll(
    pollName: PollName,
    completeCb: () => void,
    stage: Stage,
    exclude?: string,
    majorityPercent = 0.501
  ): void {
    this.polls.set(pollName, {
      completeCb,
      majorityPercent,
      stage,
      exclude,
      inFavor: []
    });
  }

  clearPoll(pollName: PollName) {
    this.polls.delete(pollName);
  }

  acceptVote(pollName: PollName, id: string, stage: Stage): Result<{ count: number; next: boolean }> {
    const poll = this.polls.get(pollName);
    if (!poll) {
      return Warn(`noPoll${pollName}`);
    }
    if (poll.stage && stage !== poll.stage) {
      return Err('invalidStage');
    }
    if (poll.exclude === id) {
      return Err('invalidVoter');
    }
    const index = poll.inFavor.indexOf(id);
    if (index >= 0) {
      poll.inFavor.splice(index, 1);
    } else {
      poll.inFavor.push(id);
    }
    const count = this._countVotes(poll);
    if (this._cbIfComplete(poll, pollName)) {
      return Ok({ count: 0, next: false });
    }
    return Ok({ count, next: this._nextComplete(poll) });
  }

  // TODO: change this to Map<Pollname, ...>, (needs to be changed on client side too)
  getVoteCounts(): Record<PollName, { count: number; next: boolean }> {
    const ret: Record<PollName, { count: number; next: boolean }> = {
      skipPrompt: { count: 0, next: false },
      sikeDispute: { count: 0, next: false },
      startNextRound: { count: 0, next: false }
    };
    for (const [pollName, poll] of this.polls) {
      ret[pollName] = {
        count: this._countVotes(poll),
        next: this._nextComplete(poll)
      };
    }
    return ret;
  }

  _cbIfComplete(poll: Poll, pollName: PollName): boolean {
    if (this._complete(poll, pollName)) {
      this.clearPoll(pollName);
      poll.completeCb();
      return true;
    }
    return false;
  }

  _complete(poll: Poll, pollName: PollName) {
    const threshold = Math.ceil(this.gameState.numVoters(poll.exclude) * poll.majorityPercent);
    if (this._countVotes(poll) >= threshold) {
      logger.info(`(pollService) ${pollName} completed`);
      return true;
    }
    return false;
  }

  _nextComplete(poll: Poll) {
    const threshold = Math.ceil(this.gameState.numVoters(poll.exclude) * poll.majorityPercent);
    return this._countVotes(poll) + 1 >= threshold;
  }

  _countVotes(poll: Poll) {
    return poll.inFavor.length;
  }

  checkComplete(): void {
    for (const [pollName, poll] of this.polls) {
      this._cbIfComplete(poll, pollName);
    }
  }

  disconnect(id: string): void {
    for (const [pollName, poll] of this.polls.entries()) {
      const index = poll.inFavor.indexOf(id);
      if (index >= 0) {
        poll.inFavor.splice(index, 1);
        if (this._pollVoteUpdateCb) {
          this._pollVoteUpdateCb({ pollName, count: this._countVotes(poll), next: this._nextComplete(poll) });
        }
      }
    }
  }
}
