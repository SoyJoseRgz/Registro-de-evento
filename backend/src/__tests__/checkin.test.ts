import request from 'supertest';
import app from '../app';

describe('Check-in Endpoints', () => {
  const tenantId = 'test-tenant-id';

  describe('POST /api/v1/tenants/:tenantId/checkin', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app)
        .post(`/api/v1/tenants/${tenantId}/checkin`)
        .send({ registrationId: 'test' });
      expect(res.status).toBe(401);
    });

    it('should return 400 for missing registrationId or qrToken', async () => {
      const res = await request(app)
        .post(`/api/v1/tenants/${tenantId}/checkin`)
        .send({});
      expect(res.status).toBe(400);
    });
  });
});
