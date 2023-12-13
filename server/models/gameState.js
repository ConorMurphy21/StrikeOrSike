const {Prompts} = require('./prompts');
const {stringMatch, getCorrections} = require('./matchUtils');
const PollService = require('./pollService');
const optionsSchema = require('./optionsSchema');
const logger = require('../logger/logger');

const defaultOptions = (lang) => {
    return {
        promptTimer: 35,
        autoNumRounds: true, // set numRounds to num players when game starts
        numRounds: 3,
        sikeDispute: true,
        sikeRetries: 0,
        promptSkipping: true,
        minPlayers: 3,
        maxPlayers: 10,
        packs: Prompts.packOptions(lang),
        customPrompts: []
    }
}

const GameState = class {
    constructor(room, options, oldPrompts) {
        this.name = room.name;
        this.stage = 'lobby'; // enum: 'lobby', 'response', 'selection', 'matching', 'endRound'
        this.options = options;
        if (!options) this.options = defaultOptions(room.lang);
        this.prompts = new Prompts(this.options.packs, this.options.customPrompts, room.lang, oldPrompts);
        this.room = room;
        this.round = 0;
        this.prompt = '';
        this.players = [];
        this.initialSelector = 0;
        this.selector = 0;
        this.selectionTypeChoice = false;
        this.selectionType = '';
        this.remainingSikeRetries = this.options.sikeRetries;
        this.corrections = {};
        this.pollService = new PollService(this);

        // keeps track of how long until the response section is over
        this.promptTimeout = null;

        this._startNextPromptCb = null;
        this._promptSkippedCb = null;
        this._selectionUnsuccessfulCb = null;
        this._matchingCompleteCb = null;
        this._disputeCompleteCb = null;

        for (const player of room.players) {
            this.players.push(
                {
                    id: player.id,
                    points: 0,
                    used: [],
                    responses: [],
                    selected: '',
                    selectionType: '',
                    match: '',
                    exactMatch: false,
                    matchingComplete: false, // set to true if explicitly no match was found or a match was found
                }
            )
        }

        if (this.options.autoNumRounds) {
            this.options.numRounds = this.numVoters()
        }

    }

    /*** Callback registry for events that may happen from disconnect ***/
    registerStartNextPromptCb(cb) {
        this._startNextPromptCb = cb;
    }

    registerPromptSkippedCb(cb) {
        this._promptSkippedCb = cb;
    }

    registerMatchingCompleteCb(cb) {
        this._matchingCompleteCb = cb;
    }

    registerSelectionUnsuccessfulCb(cb) {
        this._selectionUnsuccessfulCb = cb;
    }

    registerDisputeCompleteCb(cb) {
        this._disputeCompleteCb = cb;
    }

    /*** PROMPT RESPONSE state changes ***/
    hasNewPrompt() {
        // return false if no rounds left
        if (this.round >= this.options.numRounds) return false;
        // return true if there are still prompts available
        if (this.prompts.hasNewPrompt()) return true;

        // this is true as long as no pack is a subset of another pack
        for (const pack in this.options.packs) {
            if(!this.options.packs[pack]) return true;
        }
        return false;
    }

    beginNewPrompt() {
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
        this.stage = 'response';
        this.corrections = {};

        if (this.options.promptSkipping) {
            this.pollService.registerPoll('skipPrompt', this._promptSkippedCb, 'response');
        }

        for (const player of this.players) {
            player.responses = [];
            player.used = [];
        }
        return true;
    }

    acceptPromptResponse(id, response) {
        if (!response || typeof response !== 'string') {
            return {error: 'emptyResponse'};
        }
        response = response.trim().normalize().trim();
        if(!response){
            return {error: 'emptyResponse'};
        }
        if (this.stage === 'response') {
            const playerState = this.players.find(player => player.id === id);
            if (!playerState) {
                return {error: 'spectator'};
            }
            if (playerState.responses.find(res => this._exact_matches(res, response))) {
                return {error: 'duplicateResponse'};
            }
            playerState.responses.push(response);
            if (!this.corrections[response]) {
                getCorrections(response, this.room.lang).then((corrections) => {
                    this.corrections[response] = corrections;
                });
            }
        } else {
            return {error: 'badRequest'};
        }

        return {success: true, response};
    }

    pollVote(id, pollName) {
        return this.pollService.acceptVote(pollName, id, this.stage);
    }

    _randomizeSelectionType() {
        const r = Math.floor(Math.random() * 6);
        this.selectionTypeChoice = false;
        if (r < 3) {
            this.selectionType = 'strike';
        } else if (r < 5) {
            this.selectionType = 'sike';
        } else {
            this.selectionType = 'choice';
            this.selectionTypeChoice = true;
        }
        // this.selectionType = 'choice';
        // this.selectionTypeChoice = true;
    }

    _resetSelection(resetRetries = true) {
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
    beginSelection() {
        this.stage = 'selection';
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

    nextSelection() {
        this.stage = 'selection';
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
        this.stage = 'endRound';
        this.pollService.registerPoll('startNextRound', this._startNextPromptCb, 'endRound', null, 0.75);
        return false;
    }

    _exact_matches(string1, string2) {
        return this._match_chance(string1, string2) > 0.9999;
    }

    _match_chance(string1, string2) {
        string1 = string1.trim().normalize().trim();
        string2 = string2.trim().normalize().trim();
        return stringMatch(string1, string2,
            this.corrections[string1] ?? [], this.corrections[string2] ?? [], this.room.lang);
    }

    _autoMatch() {
        for (const player of this.players) {
            this._autoMatchSingle(player);
        }
    }

    _autoMatchSingle(player) {
        const selector = this.players[this.selector];
        const response = selector.selected;
        if (player.id === selector.id) return;
        if (player.matchingComplete) return;
        if (player.responses.length <= player.used.length) {
            player.matchingComplete = true;
            player.exactMatch = true;
        } else {
            const match = player.responses.map(r => {
                return {value: r, chance: this._match_chance(r, response)};
            }).sort((a, b) => b.chance - a.chance)[0];

            if (match.chance > 0.8 && !player.used.includes(match.value)) {
                player.used.push(match.value);
                player.match = match.value;
                player.exactMatch = match.chance > 0.9999;
                player.matchingComplete = true;
            }
        }
    }

    acceptSelectionType(id, isStrike) {
        const selector = this.players[this.selector];
        if (this.selectionTypeChoice) {
            if (this.stage === 'selection' && selector.id === id) {
                this.selectionType = isStrike ? 'strike' : 'sike';
                return {success: true};
            }
        }
        return {error: 'badRequest'};
    }

    acceptResponseSelection(id, response) {
        const selector = this.players[this.selector];
        // selectionType needs to be chosen before choosing a response
        if (this.selectionType === 'choice') return {error: 'badRequest'};

        // id must be currently selecting
        if (this.stage === 'selection' && selector.id === id) {
            // response must be in selectors responses but not used
            if (selector.responses.includes(response) && !selector.used.includes(response)) {
                selector.selected = response;
                selector.selectionType = this.selectionType;
                selector.used.push(response);
                // automatically match any obvious matches
                this._autoMatch();
                this.stage = 'matching';
                if (this.options.sikeDispute && this.selectionType === 'sike') {
                    this.pollService.registerPoll('sikeDispute',
                        () => this._sikeDisputeAction(), 'matching', this.selectorId());
                }
                return {success: true};

            }
        }
        return {error: 'badRequest'};
    }

    _sikeDisputeAction() {
        if (this.remainingSikeRetries <= 0) {
            this._disputeCompleteCb('nextSelection');
        } else {
            if (this.isActive(this.selectorId()) &&
                this.players[this.selector].responses.length > this.players[this.selector].used.length) {
                this.stage = 'selection';
                this.remainingSikeRetries--;
                this._resetSelection(false);
                this._disputeCompleteCb('reSelect');
            } else {
                this._disputeCompleteCb('nextSelection');
            }
        }
    }

    numVoters(excludedId) {
        return this.players.filter(player => player.id !== excludedId && this.isActive(player.id)).length;
    }

    /*** MATCHING state changes ***/
    matchingComplete() {
        return !this.players.find(player => player.active && (!player.matchingComplete || player.selected))
            && this.stage === 'matching';
    }


    _cbIfMatchingComplete() {
        if (this.matchingComplete() && this._matchingCompleteCb) {
            this._matchingCompleteCb(this.isActive(this.selectorId()));
        }
    }

    acceptMatch(id, match) {
        const selector = this.players[this.selector];
        const matcher = this.players.find(player => player.id === id);
        if (!matcher) return {error: 'spectator'};
        if (this.stage !== 'matching' || selector.id === id) return {error: 'badRequest'};

        // if already matched remove match from used list
        if (matcher.matchingComplete)
            matcher.used = matcher.used.filter(response => response !== matcher.match);

        // Sike
        if (!match) {
            matcher.matchingComplete = true;
            matcher.match = '';
            this._cbIfMatchingComplete();
            return {success: true};
        }

        // Strike
        if (matcher.responses.includes(match) && !matcher.used.includes(match)) {
            matcher.match = match;
            matcher.matchingComplete = true;
            matcher.used.push(match);
            this._cbIfMatchingComplete();
            return {success: true};
        }

        // if matching was unsuccessful insert back into list
        if (matcher.match)
            matcher.used.push(matcher.match);
        return {error: 'badRequest'};
    }

    getMatch(id) {
        const matcher = this.players.find(player => player.id === id);
        if (matcher.matchingComplete) {
            return matcher.match;
        }
        return undefined;
    }

    matches() {
        const matches = [];
        for (const player of this.players) {
            if (player.matchingComplete) {
                matches.push({player: player.id, response: player.match, exact: player.exactMatch});
            }
        }
        return matches;
    }

    selectionComplete() {
        // opportunity to do end round stats, for now just count the points
        const selector = this.players[this.selector];
        for (const matcher of this.players) {
            if (matcher.id === selector.id) continue;
            if (!matcher.match && !this.isActive(matcher.id)) continue;
            if (this.selectionType === 'sike' && !matcher.match) selector.points++;
            if (this.selectionType === 'strike' && matcher.match) selector.points++;
        }
    }

    getResponses(id) {
        if(this.stage !== 'endRound'){
            return {error: 'invalidStage'};
        }
        const player = this.players.find(player => player.id === id);
        if(!player){
            return {error: 'playerDoesNotExist'}
        }
        const responses = this._getResponses(player);
        return {success: true, responses};
    }

    _getResponses(player){
        return {
            id: player.id,
            all: player.responses,
            used: player.used,
            selectedStrike: player.selectionType === 'strike' ? player.selected : '',
            selectedSike: player.selectionType === 'sike' ? player.selected : '',
        }
    }

    /*** GAMEOVER state changes ***/
    gameOver() {
        this.stage = 'lobby';
        return this.players.map(player => {
            return {player: player.id, points: player.points};
        }).sort((a, b) => b.points - a.points);
    }

    /*** UTILS AND DISCONNECT ***/
    isSelector(id) {
        const selector = this.players[this.selector].id;
        return selector === id;
    }

    _activeRoomPlayers() {
        return this.room.players.filter(player => player.active);
    }

    isActive(id) {
        return this.room.players.find(player => player.id === id)?.active;
    }

    selectedResponse() {
        return this.players[this.selector].selected;
    }

    selectorId() {
        return this.players[this.selector].id;
    }

    _getTimeLeft(timeout) {
        return Math.ceil((timeout._idleStart + timeout._idleTimeout) / 1000 - process.uptime())
    }

    midgameConnect(id, oldId) {
        let player = this.players.find(player => player.id === oldId);
        if (!player) {
            logger.info('(gameState) midgame join');
            this.players.push(
                {
                    id: id,
                    points: 0,
                    responses: [],
                    used: [],
                    selected: '',
                    selectionType: '',
                    match: '',
                    exactMatch: false,
                    matchingComplete: false, // set to true if explicitly no match was found or a match was found
                }
            );
        } else {
            logger.info('(gameState) midgame rejoin');
            player.id = id;
        }
        player = this.players.find(player => player.id === id);
        // ensure if someone joins mid matching that they don't have to match since they have no responses
        if (this.stage === 'matching') {
            this._autoMatchSingle(player);
        }
        const timeleft = this._getTimeLeft(this.promptTimeout) - 1;

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
        }
    }

    getOptions() {
        const result = optionsSchema.validate(this.options, {stripUnknown: true});
        const ret = result.value;
        delete ret.customPrompts; // too big and not worth the other clients seeing
        return ret;
    }

    disconnect(id) {
        // disconnect was not hooked up properly
        // now that it is, this seems too harsh
        // so this temporarily removed at the expense of allowing an unprogressable state
        // if (this.stage === 'selection') {
        //     if (this.isSelector(id)) {
        //         if (this._selectionUnsuccessfulCb) this._selectionUnsuccessfulCb();
        //     }
        // }
        if (this.stage === 'matching') {
            this._cbIfMatchingComplete();
        }
        this.pollService.disconnect(id);
        this.pollService.checkComplete();
    }
};

module.exports = {GameState, defaultOptions};
