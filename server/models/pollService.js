module.exports = class pollService {
    constructor(gameState) {
        this.gameState = gameState;
        this.polls = {}
    }

    registerPoll(pollName, completeCb, stage, exclude = null, majorityPercent = 0.501) {
        this.polls[pollName] = {completeCb, majorityPercent, stage, exclude, inFavor: []};
    }

    clearPoll(pollName) {
        this.polls[pollName] = null;
    }

    acceptVote(pollName, id, stage) {
        if(!this.polls.hasOwnProperty(pollName) || this.polls[pollName] === null) {
            return {error: 'noPoll'};
        }
        const poll = this.polls[pollName];
        if(poll.stage && stage !== poll.stage) {
            return {error: 'wrongStage'};
        }
        if(poll.exclude === id) {
            return {error: 'invalidVoter'};
        }
        const index = poll.inFavor.indexOf(id);
        if(index >= 0) {
            poll.inFavor.splice(index, 1);
        } else {
            poll.inFavor.push(id);
        }
        const count = this.countVotes(pollName);
        if(this.cbIfComplete(pollName)) {
            return {success: true, count: 0, next: false};
        }
        return {success: true, count, next: this.nextComplete(pollName)};
    }

    getVoteCounts(){
        const ret = {}
        for(const poll in this.polls) {
            if(this.polls[poll]) {
                ret[poll] = {count: this.countVotes(poll), next: this.nextComplete(poll)};
            } else {
                ret[poll] = {count: 0, next: 0};
            }
        }
        return ret;
    }

    cbIfComplete(pollName){
        const poll = this.polls[pollName];
        if(this.complete(pollName)) {
            this.clearPoll(pollName);
            poll.completeCb();
            return true;
        }
        return false;
    }

    complete(pollName) {
        const poll = this.polls[pollName];
        const threshold = Math.ceil(this.gameState.numVoters(poll.exclude) * poll.majorityPercent);
        return this.countVotes(pollName) >= threshold;
    }

    nextComplete(pollName){
        const poll = this.polls[pollName];
        const threshold = Math.ceil(this.gameState.numVoters(poll.exclude) * poll.majorityPercent);
        return this.countVotes(pollName) + 1 >= threshold;
    }

    countVotes(pollName) {
        return this.polls[pollName].inFavor.length;
    }

    checkComplete(){
        for(const pollName in this.polls) {
            if(this.polls[pollName]) this.cbIfComplete(pollName);
        }
    }

    disconnect(id){
        for(const poll in this.polls) {
            if(this.polls[poll]) {
                const index = this.polls[poll].inFavor.indexOf(id);
                if(index >= 0) {
                    this.polls[poll].inFavor.splice(index, 1);
                }
            }
        }
    }

}