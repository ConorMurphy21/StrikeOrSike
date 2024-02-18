// noinspection JSUnusedGlobalSymbols

import socket from '@/socket/socket.js';
import { useRoomStore } from '@/stores/room.js';
import { acceptHMRUpdate, defineStore } from 'pinia';
import type {
  Player,
  Match as ServerMatch,
  PollName,
  VoteCount,
  Score as ServerScore,
  Responses,
  MidgameConnectData
} from ':common/stateTypes';
import type { Options, VisibleOptions } from ':common/options';
import { defaultOptions } from ':common/options';
import type { Result } from ':common/result';
import { isOk } from ':common/result';

type Scene =
  | 'Lobby'
  | 'Countdown'
  | 'PromptResponse'
  | 'Selection'
  | 'ActiveMatching'
  | 'MatchingSummary'
  | 'EndRound'
  | 'EndGame';

export type Match = Omit<ServerMatch, 'player'> & { player: Player };

type Score = Omit<ServerScore, 'player'> & { player: Player };

interface State {
  scene: Scene;
  prompt: string;
  timer: number;
  // for cancelling the timer
  timeoutId: null | NodeJS.Timeout;
  responses: Record<string, Responses>;
  selectionTypeChoice: boolean;
  selectionType: string;
  selector: Player | undefined;
  selectedResponse: string;
  matches: Match[];

  scores: Score[];
  // optional state
  voteCounts: {
    skipPrompt: VoteCount;
    startNextRound: VoteCount;
    sikeDispute: VoteCount;
  };
  options: Options;
  firstSelection: boolean;
  hasNextRound: boolean;
  unmatched: boolean;
}

export const useGameStore = defineStore('game', {
  state: (): State => ({
    scene: 'Lobby',
    prompt: '',
    timer: 0,
    // for cancelling the timer
    timeoutId: null,
    responses: {},
    selectionTypeChoice: false,
    selectionType: '',
    selector: undefined,
    selectedResponse: '',
    matches: [],

    scores: [],
    // optional state
    voteCounts: {
      skipPrompt: { count: 0, next: false },
      startNextRound: { count: 0, next: false },
      sikeDispute: { count: 0, next: false }
    },
    options: defaultOptions,
    firstSelection: true,
    hasNextRound: true,
    unmatched: false
  }),
  getters: {
    isSelector(): boolean {
      const room = useRoomStore();
      return this.selector?.id === room.self!.id;
    },
    playerResponses() {
      const room = useRoomStore();
      return (id: string) => {
        // default to self if not provided
        if (!id) id = room.self!.id;
        return this.responses[id];
      };
    },
    roundPoints(): number {
      if (this.selectionType === 'strike') {
        let count = 0;
        this.matches.forEach((match: Match) => {
          if (match.response !== '') {
            count++;
          }
        });
        return count;
      } else {
        let count = 0;
        this.matches.forEach((match: Match) => {
          if (match.response === '' && match.player.active) {
            count++;
          }
        });
        return count;
      }
    },
    canEndRound() {
      const room = useRoomStore();
      const self = room.self!.id;
      if (this.selector?.id !== self) return false;

      let finishedMatching = true;
      room.players.forEach((player) => {
        if (player.active && player.id !== self) {
          const match = this.matches.find((match: Match) => match.player.id === player.id);
          if (!match) finishedMatching = false;
        }
      });
      return finishedMatching;
    },

    skipVoteCount: (state) => state.voteCounts['skipPrompt'].count,
    startNextRoundCount: (state) => state.voteCounts['startNextRound'].count,
    sikeDisputeCount: (state) => state.voteCounts['sikeDispute'].count,
    skipVoteNext: (state) => state.voteCounts['skipPrompt'].next,
    startNextRoundNext: (state) => state.voteCounts['startNextRound'].next,
    sikeDisputeNext: (state) => state.voteCounts['sikeDispute'].next,
    promptSkipping: (state) => state.options.promptSkipping,
    sikeDispute: (state) => state.options.sikeDispute
  },
  actions: {
    setScene(scene: Scene) {
      this.scene = scene;
    },
    resetResponses() {
      const room = useRoomStore();
      const selfId = room.self!.id;
      this.responses = {};
      this.responses[selfId] = {
        id: selfId,
        all: [],
        used: [],
        selectedStrike: '',
        selectedSike: ''
      };
    },
    useResponse(response: string) {
      const room = useRoomStore();
      this.responses[room.self!.id].used.push(response);
    },
    useSelectorResponse(response: string) {
      const room = useRoomStore();
      this.responses[room.self!.id].used.push(response);
      if (this.selectionType === 'strike') {
        this.responses[room.self!.id].selectedStrike = response;
      } else {
        this.responses[room.self!.id].selectedSike = response;
      }
    },
    unuseResponse(response: string) {
      const room = useRoomStore();
      this.responses[room.self!.id].used = this.responses[room.self!.id].used.filter((r) => r !== response);
    },
    async startTimer() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      const initialTimer = this.timer;
      const interval = 1000; // 1s
      const maxTick = initialTimer * (1000 / interval);
      let expected = Date.now() + interval;
      let dt = 0;
      for (let tick = 1; tick <= maxTick; tick++) {
        await new Promise((resolve) => {
          this.timeoutId = setTimeout(resolve, Math.max(0, interval - dt));
        });
        dt = Date.now() - expected; // the drift (positive for overshooting)
        expected += interval;
        this.timer = initialTimer - tick * (interval / 1000);
      }
    },
    matchesFound(matches: ServerMatch[]) {
      const room = useRoomStore();
      for (const match of matches) {
        const player = room.players.find((player: Player) => player.id === match.player);
        if (!player) continue;
        const stateMatch = this.matches.find((sm: Match) => sm.player.id === player.id);
        if (stateMatch) {
          stateMatch.response = match.response;
        } else {
          this.matches.push({
            player: player,
            response: match.response,
            exact: match.exact
          });
        }
        if (match.player === room.self!.id) {
          this.useResponse(match.response);
          this.scene = 'MatchingSummary';
        }
      }
    },
    unmatch() {
      const room = useRoomStore();
      const selfId = room.self!.id;
      const usedResponse = this.matches.find((match: Match) => match.player.id === selfId)!.response;
      this.unuseResponse(usedResponse);
      this.unmatched = true;
      this.scene = 'ActiveMatching';
    },
    async getResponses(id: string): Promise<void> {
      return new Promise((resolve, reject) => {
        if (id in this.responses) {
          resolve();
          return;
        }
        socket.emit('getResponses', id, (data: Result<Responses>) => {
          if (isOk(data)) {
            this.responses[id] = data;
            resolve();
          } else {
            reject();
          }
        });
      });
    },
    bindEvents() {
      socket.on('setOptions', (options: Partial<VisibleOptions>) => {
        this.options = { ...this.options, ...options };
      });

      socket.on('selectionTypeChosen', (selectionType: string) => {
        this.selectionType = selectionType;
      });

      socket.on('setVoteCount', (data: { pollName: PollName } & VoteCount) => {
        this.voteCounts[data.pollName] = { count: data.count, next: data.next };
      });
      socket.on('beginPrompt', (prompt: string) => {
        this.timer = 3;
        this.prompt = prompt;
        this.resetResponses();
        this.matches = [];
        this.voteCounts['skipPrompt'] = { count: 0, next: false };
        this.scene = 'Countdown';
        this.firstSelection = true;
        void this.startTimer().then(() => {
          this.timer = this.options.promptTimer;
          void this.startTimer();
          this.scene = 'PromptResponse';
        });
      });

      socket.on('promptResponse', (response: string) => {
        const room = useRoomStore();
        this.responses[room.self!.id].all.push(response);
      });

      socket.on('nextSelection', (data: { selector: string; selectionType: string }) => {
        const room = useRoomStore();
        const selector = room.players.find((player: Player) => player.id === data.selector);
        // before we clear matches, make sure we used our match, this can happen if a next selection happens between
        // unmatch and match
        const selfId = room.self!.id;
        const selfMatch = this.matches.find((match: Match) => match.player.id === selfId);
        if (selfMatch && !this.responses[selfId].used.includes(selfMatch.response))
          this.useResponse(selfMatch.response);

        this.matches = [];
        this.selector = selector;
        this.selectionType = data.selectionType;
        this.voteCounts['sikeDispute'] = { count: 0, next: false };
        this.selectionTypeChoice = data.selectionType === 'choice';
        this.scene = 'Selection';
      });

      socket.on('beginMatching', (response: string) => {
        this.firstSelection = false;
        this.unmatched = false;
        this.selectedResponse = response;
        if (this.isSelector) {
          this.useSelectorResponse(response);
          this.scene = 'MatchingSummary';
        } else {
          this.scene = 'ActiveMatching';
        }
      });

      socket.on('matchesFound', (matches: ServerMatch[]) => {
        this.matchesFound(matches);
      });

      socket.on('endRound', (data: { hasNextRound: boolean }) => {
        this.scene = 'EndRound';
        this.hasNextRound = data.hasNextRound;
        this.voteCounts['startNextRound'] = { count: 0, next: false };
      });

      socket.on('gameOver', (data: { player: string; points: number }[]) => {
        const room = useRoomStore();
        this.scene = 'EndGame';
        const scores = [];
        for (const score of data) {
          scores.push({
            player: room.players.find((player) => player.id === score.player)!,
            points: score.points
          });
        }
        this.scores = scores;
      });

      socket.on('midgameConnect', (data: MidgameConnectData) => {
        const room = useRoomStore();
        this.selectionType = data.selectionType;
        if (data.selectionType === 'choice') {
          this.selectionTypeChoice = true;
        }
        this.options = { ...this.options, ...data.options };
        this.responses[data.id] = data.responses;
        this.selector = room.players.find((player) => player.id === data.selector);
        this.selectedResponse = data.selectedResponse;
        this.prompt = data.prompt;
        this.timer = data.timer;
        this.voteCounts = data.voteCounts;

        if (data.timer) {
          void this.startTimer();
        }
        const isSelector = this.selector?.id === room.self!.id;
        let scene: Scene = 'Lobby';
        //'lobby', 'response', 'selection', 'matching'
        switch (data.stage) {
          case 'lobby':
            scene = 'Lobby';
            break;
          case 'response':
            scene = 'PromptResponse';
            break;
          case 'selection':
            scene = 'Selection';
            break;
          case 'matching':
            scene = isSelector ? 'MatchingSummary' : 'ActiveMatching';
            break;
          case 'endRound':
            scene = 'EndRound';
            break;
        }
        this.scene = scene;
        this.matchesFound(data.matches);
      });
    }
  }
});

// allow hot-module reloading of the game store
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    acceptHMRUpdate(useGameStore, import.meta.hot)(newModule);
    socket.off();
    useRoomStore().bindEvents();
    useGameStore().bindEvents();
  });
}
