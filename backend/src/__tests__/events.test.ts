import request from 'supertest';
import app from '../app';

describe('Events Endpoints', () => {
  const tenantId = 'test-tenant-id';

  describe('GET /api/v1/tenants/:tenantId/events', () => {
    it('should return events list', async () => {
      const res = await request(app)
        .get(`/api/v1/tenants/${tenantId}/events`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/v1/tenants/:tenantId/events', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app)
        .post(`/api/v1/tenants/${tenantId}/events`)
        .send({
          title: 'Test Event',
          eventType: 'conference',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          capacity: 100,
        });
      expect(res.status).toBe(401);
    });
  });
});
