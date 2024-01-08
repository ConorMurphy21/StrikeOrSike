import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioc } from 'socket.io-client';
import { type AddressInfo } from 'node:net';
import { registerHandlers } from '../../src/routes/registerHandlers';
import { assert } from 'chai';
import { Player } from '../../src/state/rooms';
import { TypedClientSocket } from '../../src/types/socketServerTypes';

describe('lobby tests', () => {
  let io: Server, clientSocket1: TypedClientSocket, clientSocket2: TypedClientSocket;
  beforeEach((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      io.on('connection', (socket) => registerHandlers(io, socket));

      clientSocket1 = ioc(`http://localhost:${port}`);
      clientSocket1.on('connect', () => {
        clientSocket2 = ioc(`http://localhost:${port}`);
        clientSocket2.on('connect', done);
      });
    });
  });
  afterEach(() => {
    io.close();
    clientSocket1.close();
    clientSocket2.close();
  });

  it('create room happy updatePlayers', (done) => {
    clientSocket1.on('updatePlayers', (arg: { modifies: Player[]; deletes: string[] }) => {
      assert.deepEqual(arg.deletes, []);
      assert.isOk(arg.modifies);
      const modded: Partial<Player> = arg.modifies[0];
      assert.isOk(modded);
      delete modded.id;
      assert.deepEqual(modded, { name: 'name', leader: true, active: true });
      done();
    });
    clientSocket1.emit('createRoom', 'name', 'room');
  });

  it('join room happy updatePlayers', (done) => {
    clientSocket2.on('updatePlayers', (arg: { modifies: Player[]; deletes: string[] }) => {
      assert.deepEqual(arg.deletes, []);
      assert.isOk(arg.modifies);
      assert.strictEqual(arg.modifies.length, 2);
      const modded1: Partial<Player> = arg.modifies[0];
      delete modded1['id'];
      const modded2: Partial<Player> = arg.modifies[1];
      delete modded2['id'];
      assert.deepEqual(modded1, { name: 'name1', leader: true, active: true });
      assert.deepEqual(modded2, { name: 'name2', leader: false, active: true });
      done();
    });
    clientSocket1.on('joinRoom', () => {
      clientSocket2.emit('joinRoom', 'name2', 'room');
    });
    clientSocket1.emit('createRoom', 'name1', 'room');
  });

  it('player disconnect', (done) => {
    clientSocket2.on('joinRoom', () => {
      clientSocket2.disconnect();
    });
    clientSocket1.on('joinRoom', () => {
      clientSocket2.emit('joinRoom', 'name2', 'room');
    });
    let nupdates = 0;
    clientSocket1.on('updatePlayers', (arg: { modifies: Player[]; deletes: string[] }) => {
      assert.deepEqual(arg.deletes, []);
      assert.isOk(arg.modifies);
      const modded: Partial<Player> = arg.modifies[0];
      assert.isOk(modded);
      delete modded['id'];
      if (nupdates === 0) {
        assert.deepEqual(modded, { name: 'name1', leader: true, active: true });
      } else if (nupdates === 1) {
        assert.deepEqual(modded, {
          name: 'name2',
          leader: false,
          active: true
        });
      } else {
        assert.deepEqual(modded, {
          name: 'name2',
          leader: false,
          active: false
        });
        done();
      }
      nupdates++;
    });
    clientSocket1.emit('createRoom', 'name1', 'room');
  });

  it('leader disconnect', (done) => {
    clientSocket2.on('joinRoom', () => {
      clientSocket1.disconnect();
    });
    clientSocket1.on('joinRoom', () => {
      clientSocket2.emit('joinRoom', 'name2', 'room');
    });
    let once = false;
    clientSocket2.on('updatePlayers', (arg: { modifies: Player[]; deletes: string[] }) => {
      if (once) {
        assert.deepEqual(arg.deletes, []);
        assert.isOk(arg.modifies);
        assert.strictEqual(arg.modifies.length, 2);
        const modded1: Partial<Player> = arg.modifies[0];
        delete modded1['id'];
        const modded2: Partial<Player> = arg.modifies[1];
        delete modded2['id'];
        assert.deepEqual(modded1, {
          name: 'name1',
          leader: false,
          active: false
        });
        assert.deepEqual(modded2, {
          name: 'name2',
          leader: true,
          active: true
        });
        done();
      }
      once = true;
    });
    clientSocket1.emit('createRoom', 'name1', 'room');
  });
});
