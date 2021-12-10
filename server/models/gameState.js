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
                    selected: -1
                }
            )
        });
    }

    beginNewPrompt(){
        this.prompt = prompts[Math.floor(Math.random() * prompts.length)];
        this.stage = 'response';
        this.players.forEach(player => {
            player.responses = [];
            player.selected = -1;
        })
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

    beginSelection(room){
        //clear selections
        this.players.forEach(player => {
            player.selected = -1;
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
            player.selected = -1;
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
};

module.exports = GameState;