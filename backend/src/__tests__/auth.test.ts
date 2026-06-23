import request from 'supertest';
import app from '../app';

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@email.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should return 400 for missing token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
