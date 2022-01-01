const prompts = require('../resources/prompts.json');

const defaultOptions = () => {
    return {
        promptTimer: 45,
        numRounds: 8,
        sikeDispute: false,
        sikeRetries: 0,
        promptSkipping: false,
    }
}

const GameState = class {
    constructor(room, options /* for testing reasons*/) {
        this.name = room.name;
        this.stage = 'lobby'; // enum: 'lobby', 'response', 'responseSelection', 'responseMatching'
        this.options = options;
        if (!this.options) this.options = defaultOptions();
        this.room = room;
        this.round = 0;
        this.prompt = '';
        this.players = [];
        this.initialSelector = 0;
        this.selector = 0;
        this.selectionTypeChoice = false;
        this.selectionType = '';
        this.unusedPrompts = Array.from({length: prompts.length}, (v, i) => i);
        this.remainingSikeRetries = this.options.sikeRetries;

        // keeps track of how long until the response section is over
        this.promptTimeout = null;

        this._promptSkippedCb = null;
        this._selectionUnsuccessfulCb = null;
        this._matchingCompleteCb = null;
        this._disputeCompleteCb = null;

        room.players.forEach(player => {
            this.players.push(
                {
                    id: player.id,
                    voteSkipPrompt: false,
                    points: 0,
                    used: [],
                    responses: [],
                    selected: '',
                    sikeVote: 0,
                    match: '',
                    matchingComplete: false, // set to true if explicitly no match was found or a match was found
                }
            )
        });
    }

    /*** Callback registry for events that may happen from disconnect ***/
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
    beginNewPrompt() {
        // check if game is over
        if (this.round >= this.options.numRounds) return false;
        // no more unique prompts
        if (!this.unusedPrompts.length) return false;

        const r = Math.floor(Math.random() * this.unusedPrompts.length);
        this.prompt = prompts[this.unusedPrompts[r]];
        this.unusedPrompts.splice(r, 1);
        this.stage = 'response';

        this.players.forEach(player => {
            player.responses = [];
            player.used = [];
            player.voteSkipPrompt = false;
        });
        return true;
    }

    acceptPromptResponse(id, response) {
        if (!response) {
            return {error: 'emptyResponse'};
        }
        if (this.stage === 'response') {
            const playerState = this.players.find(player => player.id === id);
            if (playerState.responses.find(res => this._matches(res, response))) {
                return {error: 'duplicateResponse'};
            }
            playerState.responses.push(response);
        } else {
            return {error: 'badRequest'};
        }
        return {success: true};
    }

    voteSkipPrompt(id, vote) {
        if (this.stage !== 'response' || !this.options.promptSkipping) {
            return {error: 'badRequest'};
        }
        const playerState = this.players.find(player => player.id === id);
        playerState.voteSkipPrompt = !!vote;
        return this._skipPromptAction();
    }

    _skipPromptAction() {
        const numVoters = this._numVoters();
        const majority = Math.ceil(numVoters / 2);
        const votes = this.players.filter(player => this.isActive(player.id) && player.voteSkipPrompt).length;
        return {success: true, count: votes, skip: votes >= majority};
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
        this.players.forEach(player => {
            player.selected = '';
            player.sikeVote = 0;
            player.match = '';
            player.matchingComplete = false;
        });
    }

    /*** PROMPT SELECTION state changes ***/
    beginSelection() {
        this.stage = 'responseSelection';

        // increment round here, this way skipping prompts doesn't increment the round count
        this.round++;
        //reset selections and matches
        this._resetSelection();

        // update global state for responseSelection
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
        this.stage = 'responseSelection';
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
        return false;
    }

    // todo: improve automatic match catching
    _matches(string1, string2) {
        return string1 === string2;
    }

    _autoMatch() {
        const selector = this.players[this.selector];
        const response = selector.selected;
        this.players.forEach((player => {
            if (player.id === selector.id) return;
            if (player.responses.length <= player.used.length) {
                player.matchingComplete = true;
            } else {
                const match = player.responses.find(r => this._matches(r, response));
                if (match && !player.used.includes(match)) {
                    player.match = match;
                    player.matchingComplete = true;
                }
            }
        }));
    }

    acceptSelectionType(id, isStrike) {
        const selector = this.players[this.selector];
        if (this.selectionTypeChoice) {
            if (this.stage === 'responseSelection' && selector.id === id) {
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
        if (this.stage === 'responseSelection' && selector.id === id) {
            // response must be in selectors responses but not used
            if (selector.responses.includes(response) && !selector.used.includes(response)) {
                selector.selected = response;
                selector.used.push(response);

                // either transition to sikeDispute if that's set or matching otherwise
                if (this.options.sikeDispute && this.selectionType === 'sike') {
                    this.stage = 'sikeDispute';
                    return {success: true, stage: this.stage};
                } else {
                    // automatically match any obvious matches
                    this._autoMatch();
                    this.stage = 'responseMatching';
                    return {success: true, stage: this.stage};
                }
            }
        }
        return {error: 'badRequest'};
    }

    /*** DISPUTE state changes ***/

    acceptSikeDisputeVote(id, vote) {
        if (id === this.selectorId() || this.stage !== 'sikeDispute') {
            return {error: 'badRequest'};
        }
        const playerState = this.players.find(player => player.id === id);
        playerState.sikeVote = vote ? 1 : -1;
        return {success: true, action: this._voteUpdateAction()};
    }

    _voteUpdateAction() {
        const numVoters = this._numVoters(this.selectorId());
        const majorityFavored = Math.ceil(numVoters / 2);
        const majorityUnfavored = (numVoters % 2) ? majorityFavored : majorityFavored + 1;

        const upVotes = this.players.filter(player => this.isActive(player.id) && player.sikeVote > 0).length;
        // slightly favor allowing a sike over disallowing
        if (upVotes >= majorityFavored) {
            this._autoMatch();
            this.stage = 'responseMatching';
            return 'beginMatching';
        }

        const downVotes = this.players.filter(player => this.isActive(player.id) && player.sikeVote < 0).length;
        if (downVotes >= majorityUnfavored) {
            if (this.remainingSikeRetries <= 0) {
                return 'nextSelection';
            } else {
                if (this.isActive(this.selectorId()) &&
                    this.players[this.selector].responses.length > this.players[this.selector].used.length) {
                    this.stage = 'responseSelection';
                    this.remainingSikeRetries--;
                    this.players.forEach(player => {
                        player.sikeVote = 0;
                    });
                    return 'reSelect';
                } else {
                    return 'nextSelection';
                }

            }
        }

        return 'noOp';
    }

    _numVoters(excludedId) {
        return this.players.filter(player => player.id !== excludedId && this.isActive(player.id)).length;
    }

    /*** MATCHING state changes ***/
    matchingComplete() {
        return !this.players.find(player => player.active && (!player.matchingComplete || player.selected))
            && this.stage === 'responseMatching';
    }


    _cbIfMatchingComplete() {
        if (this.matchingComplete() && this._matchingCompleteCb) {
            this._matchingCompleteCb(this.isActive(this.selectorId()));
        }
    }

    acceptMatch(id, match) {
        const selector = this.players[this.selector];
        const matcher = this.players.find(player => player.id === id);
        if (matcher.matchingComplete) return {error: 'duplicateRequest'};
        if (this.stage !== 'responseMatching' || selector.id === id) return {error: 'badRequest'};

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

    disconnect(id) {
        if (this.stage === 'response') {
            const skipPrompt = this._skipPromptAction().skip;
            if(skipPrompt) this._promptSkippedCb();

        }
        if (this.stage === 'responseSelection') {
            if (this.isSelector(id)) {
                if (this._selectionUnsuccessfulCb) this._selectionUnsuccessfulCb();
            }
        }
        if (this.stage === 'sikeDispute') {
            const action = this._voteUpdateAction();
            if (action !== 'noOp') this._disputeCompleteCb(action);
        }
        if (this.stage === 'responseMatching') {
            this._cbIfMatchingComplete();
        }
    }
};

module.exports = {GameState, defaultOptions};
