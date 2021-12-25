const prompts = require('../resources/prompts.json');

const defaultOptions = () => {
    return {
        promptTimer: 45,
        numRounds: 8,
        sikeDispute: false,
        sikeRetries: 1,
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
        this.selectionType = '';
        this.unusedPrompts = Array.from({length: prompts.length}, (v, i) => i);
        this.sikeDisputeUpVotes = 0;
        this.sikeDisputeDownVotes = 0;
        this.remainingSikeRetries = this.options.sikeRetries;

        this.selectionUnsuccessfulCb = null;
        this.matchingCompleteCb = null;
        this.disputeCompleteCb = null;

        room.players.forEach(player => {
            this.players.push(
                {
                    id: player.id,
                    points: 0,
                    used: [],
                    responses: [],
                    selected: '',
                    voted: false,
                    match: '',
                    matchingComplete: false, // set to true if explicitly no match was found or a match was found
                }
            )
        });
    }

    /*** Callback registry for events that may happen from disconnect ***/
    registerMatchingCompleteCb(cb) {
        this.matchingCompleteCb = cb;
    }

    registerSelectionUnsuccessfulCb(cb) {
        this.selectionUnsuccessfulCb = cb;
    }

    registerDisputeCompleteCb(cb) {
        this.disputeCompleteCb = cb;
    }

    /*** PROMPT RESPONSE state changes ***/
    beginNewPrompt() {
        // check if game is over
        if (this.round >= this.options.numRounds) return false;
        this.round++;
        // no more unique prompts
        if (!this.unusedPrompts.length) return false;

        const r = Math.floor(Math.random() * this.unusedPrompts.length);
        this.prompt = prompts[this.unusedPrompts[r]];
        this.unusedPrompts.splice(r, 1);
        this.stage = 'response';
        this.players.forEach(player => {
            player.responses = [];
            player.used = [];
        });
        return true;
    }

    acceptPromptResponse(id, response) {
        if (response === '') {
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

    _randomizeSelectionType() {
        const r = Math.floor(Math.random() * 6);
        if (r < 3) {
            this.selectionType = 'strike';
        } else if (r < 5) {
            this.selectionType = 'sike';
        } else {
            this.selectionType = 'choice';
        }
    }

    _resetSelection() {
        this.sikeDisputeUpVotes = 0;
        this.sikeDisputeDownVotes = 0;
        this.remainingSikeRetries = this.options.sikeRetries;
        this.players.forEach(player => {
            player.selected = '';
            player.voted = false;
            player.match = '';
            player.matchingComplete = false;
        });
    }

    /*** PROMPT SELECTION state changes ***/
    beginSelection() {
        const room = this.room;
        this.stage = 'responseSelection';
        //reset selections and matches
        this._resetSelection();

        // update global state for responseSelection
        for (let i = 0; i < this.players.length; i++) {
            const j = (this.initialSelector + i) % this.players.length;
            const player = room.players.find(player => player.id === this.players[j].id);
            const active = player && player.active;

            if (active) {
                this.initialSelector = j;
                this.selector = j;
                this._randomizeSelectionType();
                return;
            }
        }
    }

    nextSelection() {
        const room = this.room;
        this.stage = 'responseSelection';
        //clear selections
        this._resetSelection();

        for (let i = 1; i <= this.players.length; i++) {
            const j = (this.selector + i) % this.players.length;
            if (j === this.initialSelector) break;
            const player = this.players[j];
            const playerMeta = room.players.find(player => player.id === player.id);
            const active = playerMeta && playerMeta.active;
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
                if (match && !player.used.find(response => match === response)) {
                    player.match = match;
                    player.matchingComplete = true;
                }
            }
        }));
    }

    acceptResponseSelection(id, response) {
        const selector = this.players[this.selector];
        if (this.stage === 'responseSelection' && selector.id === id) {
            if (selector.responses.find(r => r === response) && !selector.used.find(r => r === response)) {
                selector.selected = response;
                selector.used.push(response);
                // automatically match any obvious matches
                if(this.options.sikeDispute && this.selectionType === 'sike'){
                    this.stage = 'sikeDispute';
                    return {success: true, stage: this.stage};
                } else {
                    this._autoMatch();
                    this.stage = 'responseMatching';
                    return {success: true, stage: this.stage};
                }
            }
        }
        return {error: 'badRequest'};
    }

    /*** DISPUTE state changes ***/
    acceptDisputeVote(id, vote) {
        const playerState = this.players.find(player => player.id === id);
        if (playerState.voted) {
            return {error: 'badRequest'};
        }
        playerState.voted = true;

        if (vote) {
            this.sikeDisputeUpVotes++;
        } else {
            this.sikeDisputeDownVotes++;
        }
        return {success: true, action: this._voteUpdateAction()};
    }

    _voteUpdateAction() {
        const majority = this._activePlayerLength() / 2;
        if (this.sikeDisputeUpVotes > majority) {
            this._autoMatch();
            this.stage = 'responseMatching';
            return 'beginMatching';
        }

        this.sikeDisputeDownVotes++;
        if (this.sikeDisputeDownVotes > majority) {
            if (this.remainingSikeRetries <= 0) {
                this.stage = 'responseSelection';
                return 'reSelect';
            } else {
                this.remainingSikeRetries--;
                return 'nextSelection';
            }
        }
        return 'noOp';
    }

    _activePlayerLength() {
        return this.players.filter(player => this.room.players.find(p => p.id === player.id).active).length;
    }

    /*** MATCHING state changes ***/
    matchingComplete() {
        return !this.players.find(player => player.active && (!player.matchingComplete || player.selected))
            && this.stage === 'responseMatching';
    }


    _cbIfMatchingComplete() {
        if (this.matchingComplete() && this.matchingCompleteCb) {
            const selector = this.room.players.find(player => player.id === this.players[this.selector].id);
            this.matchingCompleteCb(selector && selector.active);
        }
    }

    acceptMatch(id, match) {
        const selector = this.players[this.selector];
        const matcher = this.players.find(player => player.id === id);
        if (matcher.matchingComplete) return {error: 'duplicateRequest'};
        if (this.stage !== 'responseMatching' || selector.id === id) return {error: 'badRequest'};

        // Sike
        if (match === '') {
            matcher.matchingComplete = true;
            if (this.selectionType === 'sike') {
                selector.points++;
            }
            this._cbIfMatchingComplete();
            return {success: true};
        }

        // Strike
        if (matcher.responses.find(r => r === match) && !matcher.used.find(r => r === match)) {
            matcher.match = match;
            matcher.matchingComplete = true;
            matcher.used.push(match);
            if (this.selectionType === 'strike') {
                selector.points++;
            }
            this._cbIfMatchingComplete();
            return {success: true};
        }
    }

    /*** UTILS AND DISCONNECT ***/
    isSelector(id) {
        const selector = this.players[this.selector].id;
        return selector === id;
    }

    selectedResponse(){
        return this.players[this.selector].selected;
    }

    selectorId(){
        return this.players[this.selector].id;
    }

    disconnect(id) {
        if (this.stage === 'responseSelection') {
            if (this.isSelector(id)) {
                if (this.selectionUnsuccessfulCb) this.selectionUnsuccessfulCb();
            }
        }
        if (this.stage === 'sikeDispute') {
            const action = this._voteUpdateAction();
            if (action !== 'noOp') this.disputeCompleteCb(action);
        }
        if (this.stage === 'responseMatching') {
            this._cbIfMatchingComplete();
        }
    }
};

module.exports = GameState;
