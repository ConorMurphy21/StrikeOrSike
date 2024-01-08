import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioc } from 'socket.io-client';
import { type AddressInfo } from 'node:net';
import { registerHandlers } from '../../src/routes/registerHandlers';
import { assert } from 'chai';
import { TypedClientSocket } from '../../src/types/socketServerTypes';

describe('Validation tests', () => {
  let io: Server;
  let clientSocket1: TypedClientSocket;
  let clientSocket2: TypedClientSocket;
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
  it('room name spaces replaced', (done) => {
    clientSocket1.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { success: true, roomName: 'hello-world' });
      done();
    });
    clientSocket1.emit('createRoom', 'name', 'hello world');
  });

  it('room name with numbers', (done) => {
    clientSocket1.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { success: true, roomName: 'hello123' });
      done();
    });
    clientSocket1.emit('createRoom', 'name', 'hello123');
  });

  it('room name with numbers and space combo', (done) => {
    clientSocket1.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { success: true, roomName: 'hello-123' });
      done();
    });
    clientSocket1.emit('createRoom', 'name', 'hello 123');
  });

  it('room name caps to lower', (done) => {
    clientSocket1.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { success: true, roomName: 'hello-123' });
      done();
    });
    clientSocket1.emit('createRoom', 'name', 'HELLO 123');
  });

  it('room name whitespace trim', (done) => {
    clientSocket1.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { success: true, roomName: 'hello-world' });
      done();
    });
    clientSocket1.emit('createRoom', 'name', '  hello world   ');
  });

  it('room name remove accents', (done) => {
    clientSocket1.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { success: true, roomName: 'resume' });
      done();
    });
    clientSocket1.emit('createRoom', 'name', 'Résumé');
  });
});

describe('create/join tests', () => {
  let io: Server, clientSocket1: TypedClientSocket, clientSocket2: TypedClientSocket, port: number;
  beforeEach((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
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

  it('create room happy', (done) => {
    clientSocket1.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { success: true, roomName: 'room' });
      done();
    });
    clientSocket1.emit('createRoom', 'name', 'room');
  });

  it('join room happy', (done) => {
    clientSocket2.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { success: true, roomName: 'room' });
      done();
    });
    clientSocket1.on('joinRoom', () => {
      clientSocket2.emit('joinRoom', 'name2', 'room');
    });
    clientSocket1.emit('createRoom', 'name1', 'room');
  });

  it('join room capitalized 1', (done) => {
    clientSocket2.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { success: true, roomName: 'room' });
      done();
    });
    clientSocket1.on('joinRoom', () => {
      clientSocket2.emit('joinRoom', 'name2', 'room');
    });
    clientSocket1.emit('createRoom', 'name1', 'Room');
  });

  it('join room capitalized 2', (done) => {
    clientSocket2.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { success: true, roomName: 'room' });
      done();
    });
    clientSocket1.on('joinRoom', () => {
      clientSocket2.emit('joinRoom', 'name2', 'ROOM');
    });
    clientSocket1.emit('createRoom', 'name1', 'Room');
  });

  it('join room noRoom', (done) => {
    clientSocket1.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { error: 'noRoom' });
      done();
    });
    clientSocket1.emit('joinRoom', 'name', 'room');
  });

  it('create room roomTaken', (done) => {
    clientSocket2.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { error: 'roomTaken' });
      done();
    });
    clientSocket1.on('joinRoom', () => {
      clientSocket2.emit('createRoom', 'name2', 'room');
    });
    clientSocket1.emit('createRoom', 'name1', 'room');
  });

  it('join room nameTaken', (done) => {
    clientSocket2.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { error: 'nameTaken' });
      done();
    });
    clientSocket1.on('joinRoom', () => {
      clientSocket2.emit('joinRoom', 'name', 'room');
    });
    clientSocket1.emit('createRoom', 'name', 'room');
  });

  it('create room roomTaken prev', (done) => {
    clientSocket2.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { success: true, roomName: 'room' });
      done();
    });
    clientSocket1.on('joinRoom', (arg) => {
      assert.deepEqual(arg, { success: true, roomName: 'room' });
      clientSocket1.disconnect();
    });
    clientSocket1.on('disconnect', () => {
      clientSocket2.emit('createRoom', 'name', 'room');
    });
    clientSocket1.emit('createRoom', 'name', 'room');
  });

  it('join room reconnect', (done) => {
    clientSocket2.on('joinRoom', () => {
      clientSocket2.disconnect();
    });
    clientSocket1.on('joinRoom', () => {
      clientSocket2.emit('joinRoom', 'name2', 'room');
    });
    clientSocket2.on('disconnect', () => {
      const clientSocket3 = ioc(`http://localhost:${port}`);
      clientSocket3.on('connect', () => {
        clientSocket3.emit('joinRoom', 'name2', 'room');
      });
      clientSocket3.on('joinRoom', (arg) => {
        assert.deepEqual(arg, { success: true, roomName: 'room' });
        done();
      });
    });
    clientSocket1.emit('createRoom', 'name1', 'room');
  });

  it('join room double reconnect', (done) => {
    clientSocket2.on('joinRoom', () => {
      clientSocket2.disconnect();
    });
    clientSocket1.on('joinRoom', () => {
      clientSocket2.emit('joinRoom', 'name2', 'room');
    });
    clientSocket2.on('disconnect', () => {
      const clientSocket3: TypedClientSocket = ioc(`http://localhost:${port}`);
      clientSocket3.on('connect', () => {
        clientSocket3.emit('joinRoom', 'name2', 'room');
      });
      clientSocket3.on('joinRoom', () => {
        clientSocket3.disconnect();
      });
      clientSocket3.on('disconnect', () => {
        const clientSocket4: TypedClientSocket = ioc(`http://localhost:${port}`);
        clientSocket4.on('connect', () => {
          clientSocket4.emit('joinRoom', 'name2', 'room');
        });
        clientSocket4.on('joinRoom', (arg) => {
          assert.deepEqual(arg, { success: true, roomName: 'room' });
          clientSocket4.disconnect();
          done();
        });
      });
    });
    clientSocket1.emit('createRoom', 'name1', 'room');
  });
});
