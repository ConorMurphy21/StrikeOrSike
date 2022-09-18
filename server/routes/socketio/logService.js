const {roomService} = require('../../models/rooms');
const logger = require('../../logger/logger');
// 1 minute
const TIMEOUT = 60 * 1000;

module.exports = () => {
    setInterval(logActivity, TIMEOUT);
}

const logActivity = () => {

}