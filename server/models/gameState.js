const {Prompts} = require('./prompts');
const {misspellMatch, getCorrections} = require('./misspellMatch');
const PollService = require('./pollService');

const defaultOptions = () => {
    return {
        promptTimer: 35,
        autoNumRounds: true, // set numRounds to num players when game starts
        numRounds: 3,
        sikeDispute: false,
        sikeRetries: 0,
        promptSkipping: false,
        minPlayers: 3,
        maxPlayers: 10
    }
}

const GameState = class {
    constructor(room, options) {
        this.name = room.name;
        this.stage = 'lobby'; // enum: 'lobby', 'response', 'selection', 'sikeDispute', 'matching'
        this.options = options;
        if (!this.options) this.options = defaultOptions();
        this.prompts = new Prompts(['standard']);
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
                    match: '',
                    matchingComplete: false, // set to true if explicitly no match was found or a match was found
                }
            )
        }

        if(this.options.autoNumRounds){
            this.options.numRounds = this.numVoters()
        }

    }

    /*** Callback registry for events that may happen from disconnect ***/
    registerStartNextPromptCb(cb){this._startNextPromptCb = cb;}
    registerPromptSkippedCb(cb) {this._promptSkippedCb = cb;}
    registerMatchingCompleteCb(cb) {this._matchingCompleteCb = cb;}
    registerSelectionUnsuccessfulCb(cb) {this._selectionUnsuccessfulCb = cb;}
    registerDisputeCompleteCb(cb) {this._disputeCompleteCb = cb;}

    /*** PROMPT RESPONSE state changes ***/
    beginNewPrompt() {
        // wrap in promise to avoid blocking
        return new Promise((resolve) => {
            // check if game is over
            if (this.round >= this.options.numRounds) {
                resolve(false);
                return;
            }
            // no more unique prompts
            this.prompts.newPrompt().then(prompt => {
                this.prompt = prompt;
                this.stage = 'response';
                this.corrections = {};

                if (this.options.promptSkipping) {
                    this.pollService.registerPoll('skipPrompt', this._promptSkippedCb, 'response');
                }

                for (const player of this.players) {
                    player.responses = [];
                    player.used = [];
                }
                resolve(true);
            });
        });
    }

    acceptPromptResponse(id, response) {
        if (!response || typeof response !== 'string') {
            return {error: 'emptyResponse'};
        }
        response = response.trim().normalize().trim();
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

    _resetSelection() {
        this.remainingSikeRetries = this.options.sikeRetries;
        this.pollService.clearPoll('sikeDispute');
        for (const player of this.players) {
            player.selected = '';
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
        this.pollService.registerPoll('startNextRound', this._startNextPromptCb, 'endRound');
        return false;
    }

    _exact_matches(string1, string2) {
        return this._match_chance(string1, string2) > 0.9999;
    }

    _match_chance(string1, string2) {
        string1 = string1.trim().normalize().trim();
        string2 = string2.trim().normalize().trim();
        const exact = string1.localeCompare(string2, this.room.lang,
            {sensitivity: 'base', ignorePunctuation: true, usage: 'search'});
        if (exact === 0) return 1;
        return misspellMatch(string1, string2, this.corrections[string1] ?? [], this.corrections[string2] ?? [], this.room.lang);
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
        if (player.responses.length <= player.used.length) {
            player.matchingComplete = true;
            if (this.selectionType === 'sike') {
                this.players[this.selector].points++;
            }
        } else {
            const match = player.responses.map(r => {
                return {value: r, chance: this._match_chance(r, response)};
            }).sort((a, b) => b.chance - a.chance)[0];

            if (match.chance > 0.8 && !player.used.includes(match)) {
                player.used.push(match.value);
                player.match = match.value;
                player.matchingComplete = true;
                if (this.selectionType === 'strike') {
                    this.players[this.selector].points++;
                }
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
                selector.used.push(response);
                // automatically match any obvious matches
                this._autoMatch();
                this.stage = 'matching';
                if (this.options.sikeDispute && this.selectionType === 'sike') {
                    this.pollService.registerPoll('disputeSike',
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
                for (const player of this.players) {
                    player.sikeVote = 0;
                }
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
        if (matcher.matchingComplete) return {error: 'duplicateRequest'};
        if (this.stage !== 'matching' || selector.id === id) return {error: 'badRequest'};

        // Sike
        if (!match) {
            matcher.matchingComplete = true;
            if (this.selectionType === 'sike') {
                selector.points++;
            }
            this._cbIfMatchingComplete();
            return {success: true};
        }

        // Strike
        if (matcher.responses.includes(match) && !matcher.used.includes(match)) {
            matcher.match = match;
            matcher.matchingComplete = true;
            matcher.used.push(match);
            if (this.selectionType === 'strike') {
                selector.points++;
            }
            this._cbIfMatchingComplete();
            return {success: true};
        }

        return {error: 'badRequest'};
    }

    matches() {
        const matches = [];
        for (const player of this.players) {
            if (player.matchingComplete) {
                matches.push({player: player.id, response: player.match});
            }
        }
        return matches;
    }

    /*** MATCHING state changes ***/
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
            this.players.push(
                {
                    id: id,
                    voteSkipPrompt: false,
                    points: 0,
                    used: [],
                    responses: [],
                    selected: '',
                    sikeVote: 0,
                    match: '',
                    matchingComplete: false, // set to true if explicitly no match was found or a match was found
                }
            );
        } else {
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
            responses: player.responses,
            usedResponses: player.used,
            selector: this.selectorId(),
            selectedResponse: this.selectedResponse(),
            prompt: this.prompt,
            timer: timeleft,
            matches: this.matches()
        }
    }

    disconnect(id) {
        if (this.stage === 'selection') {
            if (this.isSelector(id)) {
                if (this._selectionUnsuccessfulCb) this._selectionUnsuccessfulCb();
            }
        }
        if (this.stage === 'matching') {
            this._cbIfMatchingComplete();
        }
        this.pollService.checkComplete();
    }
};

module.exports = {GameState, defaultOptions};
