// noinspection JSUnusedGlobalSymbols

import socket from '@/socket/socket.js';
import { useRoomStore } from '@/stores/room.js';
import { defineStore } from 'pinia';

const state = () => ({
  scene: 'lobby',
  prompt: '',
  timer: 0,
  // for cancelling the timer
  timeoutId: null,
  responses: {},
  selectionTypeChoice: false,
  selectionType: '',
  selector: {},
  selectedResponse: '',
  matches: [],

  scores: [],
  // optional state
  voteCounts: {
    skipPrompt: { count: 0, next: false },
    startNextRound: { count: 0, next: false },
    sikeDispute: { count: 0, next: false }
  },
  options: {},
  firstSelection: true,
  hasNextRound: true,
  unmatched: false
});

export const getters = {
  isSelector() {
    const room = useRoomStore();
    return this.selector.id === room.self.id;
  },
  playerResponses() {
    const room = useRoomStore();
    return (id) => {
      // default to self if not provided
      if (!id) id = room.self.id;
      return this.responses[id];
    };
  },
  roundPoints() {
    if (this.selectionType === 'strike') {
      let count = 0;
      this.matches.forEach(match => {
        if (match.response !== '') {
          count++;
        }
      });
      return count;
    }
    if (this.selectionType === 'sike') {
      let count = 0;
      this.matches.forEach(match => {
        if (match.response === '' && match.player.active) {
          count++;
        }
      });
      return count;
    }
  },
  canEndRound() {
    const room = useRoomStore();
    const self = room.self.id;
    if (this.selector.id !== self) return false;

    let finishedMatching = true;
    room.players.forEach(player => {
      if (player.active && player.id !== self) {
        const match = this.matches.find(match => match.player.id === player.id);
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
};

const actions = {
  setScene(scene) {
    this.scene = scene;
  },
  resetResponses() {
    const room = useRoomStore();
    const selfId = room.self.id;
    this.responses = {};
    this.responses[selfId] = {
      all: [],
      used: [],
      selectedStrike: '',
      selectedSike: ''
    };
  },
  useResponse(response) {
    const room = useRoomStore();
    this.responses[room.self.id].used.push(response);
  },
  useSelectorResponse(response) {
    const room = useRoomStore();
    state.responses[room.self.id].used.push(response);
    if (state.selectionType === 'strike') {
      state.responses[room.self.id].selectedStrike = response;
    } else {
      state.responses[room.self.id].selectedSike = response;
    }
  },
  unuseResponse(response) {
    const room = useRoomStore();
    state.responses[room.self.id].used = state.responses[room.self.id].used.filter(r => r !== response);
  },
  async startTimer() {
    clearTimeout(this.timeoutId);
    const initialTimer = this.timer;
    const interval = 1000; // 1s
    const maxTick = initialTimer * (1000 / interval);
    let expected = Date.now() + interval;
    let dt = 0;
    for (let tick = 1; tick <= maxTick; tick++) {
      await new Promise(resolve => {
        this.timeoutId = setTimeout(resolve, Math.max(0, interval - dt));
      });
      dt = Date.now() - expected; // the drift (positive for overshooting)
      expected += interval;
      this.timer = initialTimer - tick * (interval / 1000);
    }
  },
  matchesFound(matches) {
    const room = useRoomStore();
    for (const match of matches) {
      const player = room.players.find(player => player.id === match.player);
      const stateMatch = this.matches.find(sm => sm.player.id === player.id);
      if (stateMatch) {
        stateMatch.response = match.response;
      } else {
        this.matches.push({
          player: player,
          response: match.response,
          exact: match.exact
        });
      }
      if (match.player === room.self.id) {
        this.useResponse(match.response);
        this.scene = 'matchingSummary';
      }
    }
  },
  unmatch() {
    const room = useRoomStore();
    const selfId = room.self.id;
    const usedResponse = this.matches.find(match => match.player.id === selfId).response;
    this.unuseResponse(usedResponse);
    this.unmatched = true;
    this.scene = 'activeMatching';
  },
  async getResponses(id) {
    return new Promise(function(resolve, reject) {
      if (this.responses.hasOwnProperty(id)) {
        resolve();
        return;
      }
      socket.emit('getResponses', id, (data) => {
        if (data.success) {
          this.responses = data.responses;
          resolve();
        } else {
          reject();
        }
      });
    });
  },
  bindEvents() {
    socket.on('setOptions', (options) => {
      this.options = options;
    });

    socket.on('selectionTypeChosen', (selectionType) => {
      this.selectionType = selectionType;
    });

    socket.on('setVoteCount', (data) => {
      this.voteCounts[data.pollName] = { count: data.count, next: data.next };
    });
    socket.on('beginPrompt', (prompt) => {
      this.timer = 3;
      this.prompt = prompt;
      this.resetResponses();
      this.matches = [];
      this.voteCounts['skipPrompt'] = { count: 0, next: false };
      this.scene = 'countdown';
      this.firstSelection = true;
      this.startTimer().then(() => {
        this.timer = state.options.promptTimer;
        this.startTimer();
        this.scene = 'promptResponse';
      });
    });

    socket.on('promptResponse', (response) => {
      const room = useRoomStore();
      this.responses[room.self.id].all.push(response);
    });

    socket.on('nextSelection', (data) => {
      const room = useRoomStore();
      const selector = room.players.find(player => player.id === data.selector);
      // before we clear matches, make sure we used our match, this can happen if a next selection happens between
      // unmatch and match
      const selfId = room.self.id;
      const selfMatch = this.matches.find(match => match.player.id === selfId);
      if (selfMatch && !this.responses[selfId].used.includes(selfMatch.response))
        this.useResponse(selfMatch.response);

      this.matches = [];
      this.selector = selector;
      this.selectionType = data.selectionType;
      this.voteCounts['sikeDispute'] = { count: 0, next: false };
      this.selectionTypeChoice = data.selectionType === 'choice';
      this.scene = 'selection';
    });

    socket.on('beginMatching', (response) => {
      this.firstSelection = false;
      this.unmatched = false;
      this.selectedResponse = response;
      if (this.isSelector) {
        this.useSelectorResponse(response);
        this.scene = 'matchingSummary';
      } else {
        this.scene = 'activeMatching';
      }
    });

    socket.on('matchesFound', (matches) => {
      this.matchesFound(matches);
    });

    socket.on('endRound', (data) => {
      this.scene = 'endRound';
      this.hasNextRound = data.hasNextRound;
      this.voteCounts['startNextRound'] = { count: 0, next: false };
    });

    socket.on('gameOver', (data) => {
      const room = useRoomStore();
      this.scene = 'endGame';
      const scores = [];
      for (const score of data) {
        scores.push({
          player: room.players.find(player => player.id === score.player),
          points: score.points
        });
      }
      this.scores = scores;
    });

    socket.on('midgameConnect', (data) => {
      const room = useRoomStore();
      this.selectionType = data.selectionType;
      if (data.selectionType === 'choice') {
        this.selectionTypeChoice = true;
      }
      this.options = data.options;
      this.responses[data.id] = data.responses;
      this.selector = room.players.find(player => player.id === data.selector);
      this.selectedResponse = data.selectedResponse;
      this.prompt = data.prompt;
      this.timer = data.timer;
      this.voteCounts = data.voteCounts;

      if (data.timer) {
        this.startTimer().then(() => {
        });
      }
      const isSelector = state.selector.id === room.self.id;
      let scene = '';
      //'lobby', 'response', 'selection', 'matching'
      switch (data.stage) {
        case 'lobby':
          scene = 'lobby';
          break;
        case 'response':
          scene = 'promptResponse';
          break;
        case 'selection':
          scene = 'selection';
          break;
        case 'matching':
          scene = isSelector ? 'matchingSummary' : 'activeMatching';
          break;
        case 'endRound':
          scene = 'endRound';
          break;
      }
      this.scene = scene;
      this.matchesFound(data.matches);
    });
  }
};

export const useGameStore = defineStore('game', {
  state,
  getters,
  actions
});