import request from 'supertest';
import app from '../app';

describe('Reports Endpoints', () => {
  const tenantId = 'test-tenant-id';
  const eventId = 'test-event-id';

  describe('GET /api/v1/tenants/:tenantId/events/:eventId/report', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app)
        .get(`/api/v1/tenants/${tenantId}/events/${eventId}/report`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/tenants/:tenantId/events/:eventId/report/export', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app)
        .get(`/api/v1/tenants/${tenantId}/events/${eventId}/report/export`);
      expect(res.status).toBe(401);
    });
  });
});
