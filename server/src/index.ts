#!/usr/bin/env node

/**
 * Module dependencies.
 */
import express, { Express, Request, Response } from 'express';

import cors from 'cors';
import path from 'path';

import logger from './logger/logger';

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use('/assets', express.static(path.join(__dirname, '../../public/assets')));

app.get('/*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

import Debug from 'debug';
const debug = Debug('strikeorsike:server');
import http from 'http';

if (process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', (err) => {
    logger.error(`(www) crash report: ${err.stack}`, () => {
      process.exit(1);
    });
  });
}

/**
 * Get port from environment and stores in Express.
 */
const port = normalizePort(process.env.PORT || '5000');
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Create socket server
 */

import { TypedServer, TypedSocket } from ':common/socketioTypes';
const io = new TypedServer(server, {
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:5001'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  allowEIO3: true
});

/**
 * Listen on socket server
 */
import { registerHandlers } from './routes/registerHandlers';
io.on('connection', (socket: TypedSocket) => registerHandlers(io, socket));

/**
 * Start room service
 */
import { startCleanupLoop } from './routes/roomService';
startCleanupLoop(io);

import { startLogServiceLoop } from './logger/logService';
startLogServiceLoop();

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server 'error' event.
 */

function onError(error: { syscall: string; code: string }) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server 'listening' event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr!.port;
  debug('Listening on ' + bind);
}
