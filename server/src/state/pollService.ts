import { GameState, Stage } from './gameState';
import { Err, Ok, Result } from '../types/result';

type Poll = {
  stage: Stage;
  completeCb: () => void;
  majorityPercent: number;
  exclude: string | undefined;
  inFavor: string[];
};

export class PollService {
  private gameState: GameState;
  private polls: Record<string, Poll>;
  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.polls = {};
  }

  registerPoll(
    pollName: string,
    completeCb: () => void,
    stage: Stage,
    exclude?: string,
    majorityPercent = 0.501
  ): void {
    this.polls[pollName] = {
      completeCb,
      majorityPercent,
      stage,
      exclude,
      inFavor: []
    };
  }

  clearPoll(pollName: string) {
    delete this.polls[pollName];
  }

  acceptVote(pollName: string, id: string, stage: Stage): Result<{ count: number; next: boolean }> {
    if (!Object.prototype.hasOwnProperty.call(this.polls, pollName) || this.polls[pollName] === null) {
      return Err(`noPoll${pollName}`);
    }
    const poll = this.polls[pollName];
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
    const count = this.countVotes(pollName);
    if (this.cbIfComplete(pollName)) {
      return Ok({ count: 0, next: false });
    }
    return Ok({ count, next: this.nextComplete(pollName) });
  }

  getVoteCounts(): Record<string, { count: number; next: boolean }> {
    const ret: Record<string, { count: number; next: boolean }> = {};
    for (const poll in this.polls) {
      if (this.polls[poll]) {
        ret[poll] = {
          count: this.countVotes(poll),
          next: this.nextComplete(poll)
        };
      } else {
        ret[poll] = { count: 0, next: false };
      }
    }
    return ret;
  }

  cbIfComplete(pollName: string): boolean {
    const poll = this.polls[pollName];
    if (this.complete(pollName)) {
      this.clearPoll(pollName);
      poll.completeCb();
      return true;
    }
    return false;
  }

  complete(pollName: string) {
    const poll = this.polls[pollName];
    const threshold = Math.ceil(this.gameState.numVoters(poll.exclude) * poll.majorityPercent);
    return this.countVotes(pollName) >= threshold;
  }

  nextComplete(pollName: string) {
    const poll = this.polls[pollName];
    const threshold = Math.ceil(this.gameState.numVoters(poll.exclude) * poll.majorityPercent);
    return this.countVotes(pollName) + 1 >= threshold;
  }

  countVotes(pollName: string) {
    return this.polls[pollName].inFavor.length;
  }

  checkComplete(): void {
    for (const pollName in this.polls) {
      if (this.polls[pollName]) this.cbIfComplete(pollName);
    }
  }

  disconnect(id: string): void {
    for (const poll in this.polls) {
      if (this.polls[poll]) {
        const index = this.polls[poll].inFavor.indexOf(id);
        if (index >= 0) {
          this.polls[poll].inFavor.splice(index, 1);
        }
      }
    }
  }
}
