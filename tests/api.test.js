import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../server/src/index.js';

describe('API Tests', () => {
  describe('Health Check', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Authentication', () => {
    it('should create a new participant', async () => {
      const response = await request(app)
        .post('/api/auth/join')
        .send({ nickname: 'TestUser' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.participant).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('sessionToken');
    });

    it('should reject empty nickname', async () => {
      const response = await request(app)
        .post('/api/auth/join')
        .send({ nickname: '' });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Admin Authentication', () => {
    it('should login with correct password', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({ password: 'test123' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should reject incorrect password', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({ password: 'wrong' });
      
      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = [];
      
      // Make 101 requests (limit is 100/minute)
      for (let i = 0; i < 101; i++) {
        requests.push(request(app).get('/health'));
      }
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});
