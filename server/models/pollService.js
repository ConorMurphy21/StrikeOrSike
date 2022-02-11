module.exports = class pollService {
    constructor(gameState) {
        this.gameState = gameState;
        this.polls = {}
    }

    registerPoll(pollName, completeCb, stage, exclude = null, majorityPercent = 0.5) {
        this.polls[pollName] = {completeCb, majorityPercent, stage, exclude, inFavor: []};
    }

    clearPoll(pollName) {
        this.polls[pollName] = null;
    }

    acceptVote(pollName, id, stage) {
        if(!this.polls.hasOwnProperty(pollName)) {
            return {error: 'noPoll'};
        }
        const poll = this.polls[pollName];
        if(stage !== poll.stage) {
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
        this.cbIfComplete(pollName);
        return {success: true, count};
    }

    cbIfComplete(pollName){
        const poll = this.polls[pollName];
        if(this.complete(pollName)) {
            poll.completeCb();
            this.clearPoll(pollName);
        }
    }

    complete(pollName) {
        const poll = this.polls[pollName];
        const threshold = Math.ceil(this.gameState.numVoters(poll.exclude) * poll.majorityPercent);
        return this.countVotes(pollName) >= threshold;
    }

    countVotes(pollName) {
        return this.polls[pollName].inFavor.length;
    }

    checkComplete(){
        for(const pollName in this.polls) {
            if(this.polls[pollName]) this.cbIfComplete(pollName);
        }
    }

}