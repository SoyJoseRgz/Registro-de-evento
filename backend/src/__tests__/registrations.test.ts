import request from 'supertest';
import app from '../app';

describe('Registrations Endpoints', () => {
  const tenantId = 'test-tenant-id';
  const eventId = 'test-event-id';

  describe('POST /api/v1/tenants/:tenantId/events/:eventId/register', () => {
    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post(`/api/v1/tenants/${tenantId}/events/${eventId}/register`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post(`/api/v1/tenants/${tenantId}/events/${eventId}/register`)
        .send({
          attendeeName: 'Test',
          attendeeEmail: 'invalid-email',
        });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/tenants/:tenantId/events/:eventId/registrations', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app)
        .get(`/api/v1/tenants/${tenantId}/events/${eventId}/registrations`);
      expect(res.status).toBe(401);
    });
  });
});
