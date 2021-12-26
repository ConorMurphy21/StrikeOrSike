const prompts = require('../resources/prompts.json')

const defaultOptions = () => {
    return {
        promptTimer: 45,
        numRounds: 5
    }
}

const GameState = class {
    constructor(room, options) {
        this.stage = 'lobby'; // enum: 'lobby', 'response', 'responseSelection', 'responseMatching'
        this.options = options;
        if (!this.options) this.options = defaultOptions();
        this.round = 0;
        this.prompt = '';
        this.players = [];
        this.initialSelector = 0;
        this.selector = 0;
        this.selectionType = '';
        this.unusedPrompts = Array.from({length: prompts.length}, (v, i) => i);


        this.selectionUnsuccessfulCb = null;
        this.matchingCompleteCb = null;

        room.players.forEach(player => {
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
        });
    }

    registerMatchingCompleteCb(cb) {
        this.matchingCompleteCb = cb;
    }

    registerSelectionUnsuccessfulCb(cb) {
        this.selectionUnsuccessfulCb = cb;
    }

    /*** PROMPT RESPONSE state changes ***/
    beginNewPrompt() {
        // check if game is over
        if(this.round >= this.options.numRounds) return false;
        this.round++;
        // no more unique prompts
        if(!this.unusedPrompts.length) return false;

        const r = Math.floor(Math.random() * this.unusedPrompts.length);
        this.prompt = prompts[this.unusedPrompts[r]];
        this.unusedPrompts = this.unusedPrompts.splice(r, 1);
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
            //TODO: check for collisions (no reason to add a word if it is already there)
            if (playerState.responses.find(res => response === res)) {
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
        this.players.forEach(player => {
            player.selected = '';
            player.match = '';
            player.matchingComplete = false;
        });
    }

    /*** PROMPT SELECTION state changes ***/
    beginSelection(room) {
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

    nextSelection(room) {
        this.stage = 'responseSelection';
        //clear selections
        this._resetSelection();

        for (let i = 1; i <= this.players.length; i++) {
            const j = (this.selector + i) % this.players.length;
            if(j === this.initialSelector) break;
            const player = room.players.find(player => player.id === this.players[j].id);
            const active = player && player.active;
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
    _autoMatch(selector, response){
        this.players.forEach((player => {
            if(player.id === selector.id) return;
            if(player.responses.length <= player.used.length){
                player.matchingComplete = true;
            }
            if (player.responses.find(r => r === response) && !player.used.find(r => r === response)) {
                player.match = response;
                player.matchingComplete = true;
            }
        }))
    }

    acceptResponseSelection(id, response) {
        const selector = this.players[this.selector];
        if (this.stage === 'responseSelection' && selector.id === id) {
            if (selector.responses.find(r => r === response) && !selector.used.find(r => r === response)) {
                selector.selected = response;
                selector.used.push(response);
                // automatically match any obvious matches
                this._autoMatch(selector, response);
                this.stage = 'responseMatching';
                return {success: true};
            }
        }
        return {error: 'badRequest'};
    }

    matchingComplete() {
        return !this.players.find(player => player.active && (!player.matchingComplete || player.selected))
            && this.stage === 'responseMatching';
    }


    _cbIfMatchingComplete() {
        if (this.matchingComplete() && this.matchingCompleteCb) {
            this.matchingCompleteCb();
        }
    }



    acceptMatch(id, match) {
        const selector = this.players[this.selector];
        const matcher = this.players.find(player => player.id === id);
        if(matcher.matchingComplete) return {error: 'duplicateRequest'};

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
        if (this.stage === 'responseMatching' && selector.id !== id) {
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
        return {error: 'badRequest'};
    }

    isSelector(id) {
        const selector = this.players[this.selector].id;
        return selector === id;
    }

    disconnect(id) {
        if (this.stage === 'responseSelection') {
            if (this.isSelector(id)) {
                this.selectionUnsuccessfulCb();
            }
        }
        if (this.stage === 'responseMatching') {
            this._cbIfMatchingComplete();
        }

    }

    acceptMatch(id, match) {
        const selector = this.players[this.selector];
        const matcher = this.players.find(player => player.id === id);
        if(matcher.matchingComplete) return {error: 'duplicateRequest'};

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
        if (this.stage === 'responseMatching' && selector.id !== id) {
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
        return {error: 'badRequest'};
    }

    isSelector(id) {
        const selector = this.players[this.selector].id;
        return selector === id;
    }

    disconnect(id) {
        if (this.stage === 'responseSelection') {
            if (this.isSelector(id)) {
                if(this.selectionUnsuccessfulCb) this.selectionUnsuccessfulCb();
            }
        }
        if (this.stage === 'responseMatching') {
            this._cbIfMatchingComplete();
        }

    }
};

module.exports = GameState;