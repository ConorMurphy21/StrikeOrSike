const {getCount} = require('../models/rooms');
const logger = require('./logger');
// 5 minute
const TIMEOUT = 60 * 5000;

module.exports = () => {
    setInterval(logActivity, TIMEOUT);
}

const logActivity = () => {
    const count = getCount();
    // reduce redundant log output
    if (count.rooms || count.players) {
        logger.info(`(logService) ${count.rooms} rooms currently active, ${count.players} players currently active`);
    }
}