const prompts = require('../resources/prompts.json')

const defaultOptions = () => {
    return {
        promptTimer: 45,
    }
}

const GameState = class {
    constructor(room, options) {
        this.stage = 'lobby'; // enum: 'lobby', 'response', 'selection', 'refute'
        this.options = options;
        if(!this.options) this.options = defaultOptions();
        this.prompt = '';
        this.players = [];
        this.initialSelector = 0;
        this.selector = 0;
        this.selectionType = '';
        room.players.forEach(player => {
            this.players.push(
                {
                    id: player.id,
                    responses: [],
                    selected: ''
                }
            )
        });
    }

    /*** PROMPT RESPONSE state changes ***/
    beginNewPrompt(){
        this.prompt = prompts[Math.floor(Math.random() * prompts.length)];
        this.stage = 'response';
        this.players.forEach(player => {
            player.responses = [];
        });
    }

    acceptPromptResponse(id, response){
        if(this.stage === 'response') {
            const playerState = this.players.find(player => player.id === id);
            //TODO: check for collisions (no reason to add a word if it is already there)
            playerState.responses.push(response);
        } else {
            return {error: 'badRequest'}
        }
        return {success: true};
    }

    randomizeSelectionType() {
        const r = Math.floor(Math.random() * 6);
        if(r < 3){
            this.selectionType = 'strike';
        } else if(r < 5){
            this.selectionType = 'sike';
        } else {
            this.selectionType = 'choice';
        }
    }


    /*** PROMPT SELECTION state changes ***/
    beginSelection(room){
        this.stage = 'selection';
        //clear selections
        this.players.forEach(player => {
            player.selected = '';
        });

        // update global state for selection
        for(let i = this.initialSelector; ; i = (i + 1) % this.players.length){
            const active = room.players.find(player => player.id === this.players[i].id).active;
            if(active){
                this.initialSelector = i;
                this.selector = i;
                this.randomizeSelectionType();
                return;
            }
        }
    }

    nextSelection(room){
        //clear selections
        this.players.forEach(player => {
            player.selected = '';
        });

        for(let i = this.selector; i !== this.initialSelector; i = (i + 1) % this.players.length){
            const active = room.players.find(player => player.id === this.players[i].id).active;
            if(active){
                this.selector = i;
                this.randomizeSelectionType(state);
                return true;
            }
        }
        this.initialSelector = (this.initialSelector + 1) % this.players.length;
        return false;
    }

    acceptResponseSelection(id, response){
        const selector = this.players[this.selector];
        if(this.stage === 'selection' && selector.id === id){
            if(selector.responses.find(r => r === response)){
                selector.selected = response;
                this.stage = 'matching';
            } else {
                return {error: 'badRequest'};
            }
        } else {
            return {error: 'badRequest'};
        }
        return {success: true};
    }
};

module.exports = GameState;