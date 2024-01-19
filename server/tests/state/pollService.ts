import { PollService } from '../../src/state/pollService';
import { Room } from '../../src/state/rooms';
import { GameState } from '../../src/state/gameState';
import { assert } from 'chai';
import { isErr, Result } from ':common/result';
import { PollName, Player, Stage } from ':common/stateTypes';

describe('PollVote tests', () => {
  it('unregistered poll', () => {
    const [, pollService] = initPollService(5);
    const result = pollService.acceptVote(PollName.SkipPrompt, '0', Stage.Lobby);
    assert.isTrue(isErr(result));
  });

  it('unregistered poll', () => {
    const [, pollService] = initPollService(5);
    pollService.registerPoll(PollName.SkipPrompt, () => {}, Stage.Lobby);
    pollService.clearPoll(PollName.SkipPrompt);
    const result = pollService.acceptVote(PollName.SkipPrompt, '0', Stage.Lobby);
    assert.isTrue(isErr(result));
  });

  it('in favor odd', () => {
    const n = 7;
    const [, pollService] = initPollService(n);
    pollService.registerPoll(PollName.SkipPrompt, () => {}, Stage.Lobby, undefined, 0.501);
    let i: number;
    for (i = 0; i < n - i - 3; i++) {
      const result = pollService.acceptVote(PollName.SkipPrompt, i.toString(), Stage.Lobby);
      assertMatches(result, i + 1, false);
    }
    let result = pollService.acceptVote(PollName.SkipPrompt, i.toString(), Stage.Lobby);
    assertMatches(result, i + 1, true);
    result = pollService.acceptVote(PollName.SkipPrompt, (i + 1).toString(), Stage.Lobby);
    assertMatches(result, 0, false);
    result = pollService.acceptVote(PollName.SkipPrompt, (i + 2).toString(), Stage.Lobby);
    assert.isTrue(isErr(result));
  });

  it('in favor even', () => {
    const n = 8;
    const [, pollService] = initPollService(n);
    pollService.registerPoll(PollName.SkipPrompt, () => {}, Stage.Lobby, undefined, 0.501);
    let i: number;
    for (i = 0; i < n - i - 3; i++) {
      const result = pollService.acceptVote(PollName.SkipPrompt, i.toString(), Stage.Lobby);
      assertMatches(result, i + 1, false);
    }
    let result = pollService.acceptVote(PollName.SkipPrompt, i.toString(), Stage.Lobby);
    assertMatches(result, i + 1, true);
    result = pollService.acceptVote(PollName.SkipPrompt, (i + 1).toString(), Stage.Lobby);
    assertMatches(result, 0, false);
    result = pollService.acceptVote(PollName.SkipPrompt, (i + 2).toString(), Stage.Lobby);
    assert.isTrue(isErr(result));
  });

  // leaving this test case out because it's unclear if inactive players should be skipped
  // mobile players will often disconnect and reconnect, having immediate effects on their disconnects
  // is maybe problematic
  it.skip('in favor w inactivity', (done) => {
    const n = 8;
    const [players, pollService] = initPollService(n);
    pollService.registerPoll(
      PollName.SkipPrompt,
      () => {
        done();
      },
      Stage.Lobby,
      undefined,
      0.501
    );
    let i: number;
    for (i = 0; i < n - i - 3; i++) {
      const result = pollService.acceptVote(PollName.SkipPrompt, i.toString(), Stage.Lobby);
      assertMatches(result, i + 1, false);
    }
    const result = pollService.acceptVote(PollName.SkipPrompt, i.toString(), Stage.Lobby);
    assertMatches(result, i + 1, true);
    players[n - 1].active = false;
    pollService.disconnect((n - 1).toString());
  });

  it('double vote', () => {
    const [, pollService] = initPollService(5);
    pollService.registerPoll(PollName.SkipPrompt, () => {}, Stage.Lobby);
    let result = pollService.acceptVote(PollName.SkipPrompt, '0', Stage.Lobby);
    assertMatches(result, 1, false);
    result = pollService.acceptVote(PollName.SkipPrompt, '0', Stage.Lobby);
    assertMatches(result, 0, false);
  });

  it('BadRequest Self Vote', () => {
    const [, pollService] = initPollService(5);
    pollService.registerPoll(PollName.SkipPrompt, () => {}, Stage.Lobby, '0');
    const result = pollService.acceptVote(PollName.SkipPrompt, '0', Stage.Lobby);
    assert.isTrue(isErr(result));
  });
});

function assertMatches(actual: Result<{ count: number; next: boolean }>, count: number, next: boolean) {
  if (isErr(actual)) {
    assert.fail();
  } else {
    assert.strictEqual(actual.count, count);
    assert.strictEqual(actual.next, next);
  }
}

function initPollService(n: number): [Player[], PollService] {
  const players: Player[] = [];
  for (let i = 0; i < n; i++) {
    players[i] = {
      id: i.toString(),
      name: i.toString(),
      leader: false,
      active: true
    };
  }
  players[0].leader = true;
  const room: Room = {
    name: 'test',
    lastActivity: 0,
    players,
    lang: 'en-CA',
    state: null
  };
  const gameState = new GameState(room);
  const pollService = new PollService(gameState);
  return [players, pollService];
}
