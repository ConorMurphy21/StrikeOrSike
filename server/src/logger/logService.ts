import logger from './logger';

import { getCount } from '../models/rooms';

// 5 minute
const TIMEOUT = 60 * 5000;

export function startLogServiceLoop(): void {
  setInterval(logActivity, TIMEOUT);
}

function logActivity() {
  const count = getCount();
  // reduce redundant log output
  if (count.rooms || count.players) {
    logger.info(`(logService) ${count.rooms} rooms currently active, ${count.players} players currently active`);
  }
}
