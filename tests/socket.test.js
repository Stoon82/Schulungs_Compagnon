import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { io as Client } from 'socket.io-client';
import { createServer } from 'http';
import { Server } from 'socket.io';

describe('Socket.IO Tests', () => {
  let io, serverSocket, clientSocket;
  let httpServer;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = Client(`http://localhost:${port}`);
      
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
  });

  it('should connect successfully', () => {
    expect(clientSocket.connected).toBe(true);
  });

  it('should respond to ping with pong', (done) => {
    clientSocket.emit('ping');
    
    clientSocket.on('pong', (data) => {
      expect(data).toHaveProperty('timestamp');
      done();
    });
  });

  it('should broadcast mood updates', (done) => {
    const moodData = {
      participantId: 'test-123',
      mood: 'aha',
      moduleId: 'module_1'
    };

    clientSocket.on('mood:update', (data) => {
      expect(data).toEqual(moodData);
      done();
    });

    serverSocket.emit('mood:update', moodData);
  });

  it('should handle admin broadcast', (done) => {
    const broadcastData = {
      message: 'Test broadcast',
      type: 'info'
    };

    clientSocket.on('admin:broadcast', (data) => {
      expect(data).toEqual(broadcastData);
      done();
    });

    serverSocket.emit('admin:broadcast', broadcastData);
  });
});
