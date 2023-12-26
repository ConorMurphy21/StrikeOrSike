import { Prompts } from './prompts';
import { getCorrections, stringMatch } from './matchUtils';
import { PollService } from './pollService';
import logger from '../logger/logger';
import { Room, Player as RoomPlayer } from './rooms';
import { Err, Info, Ok, Result, Success, VoidResult, Warning } from '../types/result';
import { ConfigurableOptions, defaultOptions, getConfigurableOptionsSchema, Options } from './options';

export enum Stage {
  Lobby,
  Response,
  Selection,
  Matching,
  EndRound
}
export enum SelectionType {
  Strike = 'strike',
  Sike = 'sike',
  Choice = 'choice'
}

type Player = {
  id: string;
  points: number;
  used: string[];
  responses: string[];
  selected: string;
  selectionType: SelectionType;
  match: string;
  exactMatch: boolean;
  matchingComplete: boolean; // set to true if explicitly no match was found or a match was found
};

type Match = {
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

export class GameState {
  stage: Stage;
  public options: Options;
  prompts: Prompts;
  room: Room;
  private round: number;
  prompt: string;
  players: Player[];
  initialSelector: number;
  selector: number;
  selectionTypeChoice: boolean;
  selectionType: SelectionType;
  private remainingSikeRetries: number;

  private _startNextPromptCb: null | (() => void);
  private _promptSkippedCb: null | (() => void);
  private _selectionUnsuccessfulCb: null | (() => void);
  private _disputeCompleteCb: null | ((action: string) => void);
  private _matchingCompleteCb: null | ((selectorActive: boolean) => void);
  private corrections: Record<string, string[]>;
  public promptTimeout: NodeJS.Timeout | null;
  private pollService: PollService;

  constructor(room: Room, options?: Options, oldPrompts?: Prompts) {
    this.stage = Stage.Lobby;
    if (options) {
      this.options = options;
    } else {
      this.options = defaultOptions(room.lang);
    }
    this.prompts = new Prompts(this.options.packs, this.options.customPrompts, room.lang, oldPrompts);
    this.room = room;
    this.round = 0;
    this.prompt = '';
    this.players = [];
    this.initialSelector = 0;
    this.selector = 0;
    this.selectionTypeChoice = false;
    this.selectionType = SelectionType.Strike;
    this.remainingSikeRetries = this.options.sikeRetries;
    this.corrections = {};
    this.pollService = new PollService(this);

    // keeps track of how long until the response section is over
    this.promptTimeout = null;

    this._startNextPromptCb = null;
    this._promptSkippedCb = null;
    this._selectionUnsuccessfulCb = null;
    this._disputeCompleteCb = null;
    this._matchingCompleteCb = null;

    for (const player of room.players) {
      this.players.push({
        id: player.id,
        points: 0,
        used: [],
        responses: [],
        selected: '',
        selectionType: SelectionType.Sike,
        match: '',
        exactMatch: false,
        matchingComplete: false // set to true if explicitly no match was found or a match was found
      });
    }

    if (this.options.autoNumRounds) {
      this.options.numRounds = this.numVoters();
    }
  }

  /*** Callback registry for events that may happen from disconnect ***/
  registerStartNextPromptCb(cb: () => void): void {
    this._startNextPromptCb = cb;
  }

  registerPromptSkippedCb(cb: () => void): void {
    this._promptSkippedCb = cb;
  }

  registerSelectionUnsuccessfulCb(cb: () => void): void {
    this._selectionUnsuccessfulCb = cb;
  }

  registerDisputeCompleteCb(cb: (action: string) => void): void {
    this._disputeCompleteCb = cb;
  }

  registerMatchingCompleteCb(cb: (selectorActive: boolean) => void): void {
    this._matchingCompleteCb = cb;
  }

  /*** PROMPT RESPONSE state changes ***/
  hasNewPrompt(): boolean {
    // return false if no rounds left
    if (this.round >= this.options.numRounds) return false;
    // return true if there are still prompts available
    if (this.prompts.hasNewPrompt()) return true;

    // this is true as long as no pack is a subset of another pack
    for (const pack in this.options.packs) {
      if (!this.options.packs[pack]) return true;
    }
    return false;
  }

  beginNewPrompt(): boolean {
    // wrap in promise to avoid blocking
    // check if game is over
    if (this.round >= this.options.numRounds) {
      return false;
    }
    this.prompt = this.prompts.newPrompt(this._activeRoomPlayers());

    // if no more unique prompts try adding a pack
    while (!this.prompt) {
      let changed = false;
      for (const pack in this.options.packs) {
        if (!this.options.packs[pack]) {
          this.options.packs[pack] = true;
          changed = true;
          break;
        }
      }
      if (!changed) return false;
      this.prompts = new Prompts(this.options.packs, this.options.customPrompts, this.room.lang, this.prompts);
      this.prompt = this.prompts.newPrompt(this._activeRoomPlayers());
    }
    this.stage = Stage.Response;
    this.corrections = {};

    if (this.options.promptSkipping) {
      if (this._promptSkippedCb) {
        this.pollService.registerPoll('skipPrompt', this._promptSkippedCb, Stage.Response);
      }
    }

    for (const player of this.players) {
      player.responses = [];
      player.used = [];
    }
    return true;
  }

  acceptPromptResponse(id: string, response: string): Result<{ response: string }> {
    if (!response || typeof response !== 'string') {
      return Warning('emptyResponse');
    }
    response = response.trim().normalize().trim();
    if (!response) {
      return Warning('emptyResponse');
    }
    if (this.stage === Stage.Response) {
      const playerState = this.players.find((player) => player.id === id);
      if (!playerState) {
        return Err('spectator');
      }
      if (playerState.responses.find((res) => this._exact_matches(res, response))) {
        return Info('duplicateResponse');
      }
      playerState.responses.push(response);
      if (!this.corrections[response]) {
        getCorrections(response, this.room.lang).then((corrections) => {
          this.corrections[response] = corrections;
        });
      }
    } else {
      return Info('invalidStage');
    }

    return Ok({ response });
  }

  pollVote(id: string, pollName: string): Result<{ count: number; next: boolean }> {
    return this.pollService.acceptVote(pollName, id, this.stage);
  }

  _randomizeSelectionType(): void {
    const r = Math.floor(Math.random() * 6);
    this.selectionTypeChoice = false;
    if (r < 3) {
      this.selectionType = SelectionType.Strike;
    } else if (r < 5) {
      this.selectionType = SelectionType.Sike;
    } else {
      this.selectionType = SelectionType.Choice;
      this.selectionTypeChoice = true;
    }
    // this.selectionType = SelectionType.Choice;
    // this.selectionTypeChoice = true;
  }

  _resetSelection(resetRetries = true): void {
    if (resetRetries) {
      this.remainingSikeRetries = this.options.sikeRetries;
    }
    this.pollService.clearPoll('sikeDispute');
    for (const player of this.players) {
      player.match = '';
      player.matchingComplete = false;
    }
  }

  /*** PROMPT SELECTION state changes ***/
  beginSelection(): boolean {
    this.stage = Stage.Selection;
    this.pollService.clearPoll('skipPrompt');

    // increment round here, this way skipping prompts doesn't increment the round count
    this.round++;
    //reset selections and matches
    this._resetSelection();

    // update global state for selection
    for (let i = 0; i < this.players.length; i++) {
      const j = (this.initialSelector + i) % this.players.length;
      const player = this.players[j];
      const active = this.isActive(player.id);
      const hasPossibleSelection = player.responses.length > player.used.length;
      if (active && hasPossibleSelection) {
        this.initialSelector = j;
        this.selector = j;
        this._randomizeSelectionType();
        return true;
      }
    }
    return false;
  }

  nextSelection(): boolean {
    this.stage = Stage.Selection;
    //clear selections
    this._resetSelection();

    for (let i = 1; i <= this.players.length; i++) {
      const j = (this.selector + i) % this.players.length;
      if (j === this.initialSelector) break;
      const player = this.players[j];
      const active = this.isActive(player.id);
      const hasPossibleSelection = player.responses.length > player.used.length;
      if (active && hasPossibleSelection) {
        this.selector = j;
        this._randomizeSelectionType();
        return true;
      }
    }
    this.initialSelector = (this.initialSelector + 1) % this.players.length;
    this.stage = Stage.EndRound;
    if (this._startNextPromptCb) {
      this.pollService.registerPoll('startNextRound', this._startNextPromptCb, Stage.EndRound, undefined, 0.75);
    }
    return false;
  }

  _exact_matches(string1: string, string2: string): boolean {
    return this._match_chance(string1, string2) > 0.9999;
  }

  _match_chance(string1: string, string2: string): number {
    string1 = string1.trim().normalize().trim();
    string2 = string2.trim().normalize().trim();
    return stringMatch(
      string1,
      string2,
      this.corrections[string1] ?? [],
      this.corrections[string2] ?? [],
      this.room.lang
    );
  }

  _autoMatch(): void {
    for (const player of this.players) {
      this._autoMatchSingle(player);
    }
  }

  _autoMatchSingle(player: Player): void {
    const selector = this.players[this.selector];
    const response = selector.selected;
    if (player.id === selector.id) return;
    if (player.matchingComplete) return;
    if (player.responses.length <= player.used.length) {
      player.matchingComplete = true;
      player.exactMatch = true;
    } else {
      const match = player.responses
        .map((r) => {
          return { value: r, chance: this._match_chance(r, response) };
        })
        .sort((a, b) => b.chance - a.chance)[0];

      if (match.chance > 0.8 && !player.used.includes(match.value)) {
        player.used.push(match.value);
        player.match = match.value;
        player.exactMatch = match.chance > 0.9999;
        player.matchingComplete = true;
      }
    }
  }

  acceptSelectionType(id: string, isStrike: boolean): VoidResult {
    const selector = this.players[this.selector];
    if (this.selectionTypeChoice) {
      if (this.stage === Stage.Selection && selector.id === id) {
        this.selectionType = isStrike ? SelectionType.Strike : SelectionType.Sike;
        return Success();
      }
    }
    return Err('badRequest');
  }

  acceptResponseSelection(id: string, response: string): VoidResult {
    const selector = this.players[this.selector];
    // selectionType needs to be chosen before choosing a response
    if (this.selectionType === SelectionType.Choice) return Err('notChoosen');

    // id must be currently selecting
    if (this.stage === Stage.Selection && selector.id === id) {
      // response must be in selectors responses but not used
      if (selector.responses.includes(response) && !selector.used.includes(response)) {
        selector.selected = response;
        selector.selectionType = this.selectionType;
        selector.used.push(response);
        // automatically match any obvious matches
        this._autoMatch();
        this.stage = Stage.Matching;
        if (this.options.sikeDispute && this.selectionType === SelectionType.Sike) {
          this.pollService.registerPoll(
            'sikeDispute',
            () => this._sikeDisputeAction(),
            Stage.Matching,
            this.selectorId()
          );
        }
        return Success();
      }
    }
    return Err('badRequest');
  }

  _sikeDisputeAction(): void {
    if (this.remainingSikeRetries <= 0) {
      if (this._disputeCompleteCb) this._disputeCompleteCb('nextSelection');
    } else {
      if (
        this.isActive(this.selectorId()) &&
        this.players[this.selector].responses.length > this.players[this.selector].used.length
      ) {
        this.stage = Stage.Selection;
        this.remainingSikeRetries--;
        this._resetSelection(false);
        if (this._disputeCompleteCb) this._disputeCompleteCb('reSelect');
      } else {
        if (this._disputeCompleteCb) this._disputeCompleteCb('nextSelection');
      }
    }
  }

  numVoters(excludedId?: string): number {
    return this.players.filter((player) => player.id !== excludedId && this.isActive(player.id)).length;
  }

  /*** MATCHING state changes ***/
  matchingComplete(): boolean {
    return (
      this.players.every((player) => !this.isActive(player.id) || player.matchingComplete || player.selected) &&
      this.stage === Stage.Matching
    );
  }

  _cbIfMatchingComplete(): void {
    if (this.matchingComplete() && this._matchingCompleteCb) {
      this._matchingCompleteCb(this.isActive(this.selectorId()));
    }
  }

  acceptMatch(id: string, match: string): VoidResult {
    const selector = this.players[this.selector];
    const matcher = this.players.find((player) => player.id === id);
    if (!matcher) return Err('spectator');
    if (this.stage !== Stage.Matching || selector.id === id) return Err('badRequest');

    // if already matched remove match from used list
    if (matcher.matchingComplete) matcher.used = matcher.used.filter((response) => response !== matcher.match);

    // Sike
    if (!match) {
      matcher.matchingComplete = true;
      matcher.match = '';
      this._cbIfMatchingComplete();
      return Success();
    }

    // Strike
    if (matcher.responses.includes(match) && !matcher.used.includes(match)) {
      matcher.match = match;
      matcher.matchingComplete = true;
      matcher.used.push(match);
      this._cbIfMatchingComplete();
      return Success();
    }

    // if matching was unsuccessful insert back into list
    if (matcher.match) matcher.used.push(matcher.match);
    return Err('badRequest');
  }

  getMatch(id: string): string | undefined {
    const matcher = this.players.find((player) => player.id === id);
    if (matcher && matcher.matchingComplete) {
      return matcher.match;
    }
    return undefined;
  }

  matches(): Match[] {
    const matches = [];
    for (const player of this.players) {
      if (player.matchingComplete) {
        matches.push({
          player: player.id,
          response: player.match,
          exact: player.exactMatch
        });
      }
    }
    return matches;
  }

  selectionComplete(): void {
    // opportunity to do end round stats, for now just count the points
    const selector = this.players[this.selector];
    for (const matcher of this.players) {
      if (matcher.id === selector.id) continue;
      if (!matcher.match && !this.isActive(matcher.id)) continue;
      if (this.selectionType === SelectionType.Sike && !matcher.match) selector.points++;
      if (this.selectionType === SelectionType.Strike && matcher.match) selector.points++;
    }
  }

  getResponses(id: string): Result<Responses> {
    if (this.stage !== Stage.EndRound) {
      return Err('invalidStage');
    }
    const player = this.players.find((player) => player.id === id);
    if (!player) {
      return Err('playerDoesNotExist');
    }
    const responses = this._getResponses(player);
    return Ok(responses);
  }

  _getResponses(player: Player): Responses {
    return {
      id: player.id,
      all: player.responses,
      used: player.used,
      selectedStrike: player.selectionType === SelectionType.Strike ? player.selected : '',
      selectedSike: player.selectionType === SelectionType.Sike ? player.selected : ''
    };
  }

  /*** GAMEOVER state changes ***/
  gameOver(): { player: string; points: number }[] {
    this.stage = Stage.Lobby;
    return this.players
      .map((player) => {
        return { player: player.id, points: player.points };
      })
      .sort((a, b) => b.points - a.points);
  }

  /*** UTILS AND DISCONNECT ***/
  isSelector(id: string): boolean {
    const selector = this.players[this.selector].id;
    return selector === id;
  }

  _activeRoomPlayers(): RoomPlayer[] {
    return this.room.players.filter((player) => player.active);
  }

  isActive(id: string): boolean {
    const player = this.room.players.find((player) => player.id === id);
    return !!player && player.active;
  }

  selectedResponse(): string {
    return this.players[this.selector].selected;
  }

  selectorId(): string {
    return this.players[this.selector].id;
  }

  _getTimeLeft(timeout: NodeJS.Timeout) {
    // todo: do this in a safer way
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return Math.ceil((timeout._idleStart + timeout._idleTimeout) / 1000 - process.uptime());
  }

  midgameConnect(id: string, oldId?: string) {
    let player = this.players.find((player) => player.id === oldId);
    if (!player) {
      logger.info('(gameState) midgame join');
      this.players.push({
        id: id,
        points: 0,
        responses: [],
        used: [],
        selected: '',
        selectionType: SelectionType.Strike,
        match: '',
        exactMatch: false,
        matchingComplete: false // set to true if explicitly no match was found or a match was found
      });
    } else {
      logger.info('(gameState) midgame rejoin');
      player.id = id;
    }
    player = this.players.find((player) => player.id === id)!;
    // ensure if someone joins mid matching that they don't have to match since they have no responses
    if (this.stage === Stage.Matching) {
      this._autoMatchSingle(player);
    }
    const timeleft = this.promptTimeout ? this._getTimeLeft(this.promptTimeout) - 1 : 0;

    return {
      stage: this.stage,
      selectionType: this.selectionType,
      responses: this._getResponses(player),
      selector: this.selectorId(),
      selectedResponse: this.selectedResponse(),
      prompt: this.prompt,
      options: this.getOptions(),
      timer: timeleft,
      matches: this.matches(),
      voteCounts: this.pollService.getVoteCounts()
    };
  }

  getOptions(): ConfigurableOptions {
    const result = getConfigurableOptionsSchema().parse(this.options);
    delete result.customPrompts; // too big and not worth the other clients seeing
    return result;
  }

  disconnect(id: string): void {
    // disconnect was not hooked up properly
    // now that it is, this seems too harsh
    // so this temporarily removed at the expense of allowing an unprogressable state
    // if (this.stage === Stage.Selection) {
    //     if (this.isSelector(id)) {
    //         if (this._selectionUnsuccessfulCb) this._selectionUnsuccessfulCb();
    //     }
    // }
    if (this.stage === Stage.Matching) {
      this._cbIfMatchingComplete();
    }
    this.pollService.disconnect(id);
    this.pollService.checkComplete();
  }
}
