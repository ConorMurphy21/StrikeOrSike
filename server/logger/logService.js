const {getCount} = require('../models/rooms');
const logger = require('./logger');
// 1 minute
const TIMEOUT = 60 * 1000;

module.exports = () => {
    setInterval(logActivity, TIMEOUT);
}

const logActivity = () => {
    const count = getCount();
    logger.info(`(logService) ${count.rooms} rooms currently active, ${count.players} players currently active`);
}