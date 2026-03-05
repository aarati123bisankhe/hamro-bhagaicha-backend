jest.mock('../../configs/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../configs/sms', () => ({
  sendSms: jest.fn().mockResolvedValue({ sid: 'sms-1', status: 'queued', to: '+9779800000000' }),
}));

import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

const describeIfMongo = process.env.RUN_INTEGRATION === "true" ? describe : describe.skip;

const makeUserPayload = (suffix: string) => ({
  fullname: `Test User ${suffix}`,
  email: `test_${suffix}@example.com`,
  password: 'password123',
  phoneNumber: '9845123456',
  address: 'Kathmandu',
});

describeIfMongo('Authentication Integration Tests', () => {
  const baseUser = makeUserPayload(String(Date.now()));
  let token = '';

  beforeAll(async () => {
    await UserModel.deleteMany({ email: { $regex: /test_.*@example\.com$/ } });
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: { $regex: /test_.*@example\.com$/ } });
  });

  describe('POST /api/auth/register', () => {
    test('1. registers a new user', async () => {
      const response = await request(app).post('/api/auth/register').send(baseUser);
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(baseUser.email);
    });

    test('2. rejects duplicate email', async () => {
      const response = await request(app).post('/api/auth/register').send(baseUser);
      expect(response.status).toBe(409);
    });

    test('3. rejects invalid body', async () => {
      const response = await request(app).post('/api/auth/register').send({ email: 'bademail' });
      expect(response.status).toBe(400);
    });

    test('4. rejects too-short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...makeUserPayload('shortpwd'), password: '123' });
      expect(response.status).toBe(400);
    });

    test('5. rejects missing phoneNumber', async () => {
      const payload: any = makeUserPayload('nophone');
      delete payload.phoneNumber;
      const response = await request(app).post('/api/auth/register').send(payload);
      expect(response.status).toBe(400);
    });

    test('6. rejects register when address is too short', async () => {
      const payload = { ...makeUserPayload(`second_${Date.now()}`), address: 'kt' };
      const response = await request(app).post('/api/auth/register').send(payload);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('7. logs in successfully', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: baseUser.email,
        password: baseUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      token = response.body.token;
    });

    test('8. fails with wrong password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: baseUser.email,
        password: 'wrongpassword',
      });
      expect(response.status).toBe(401);
    });

    test('9. fails with unknown user', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: `unknown_${Date.now()}@example.com`,
        password: 'password123',
      });
      expect(response.status).toBe(404);
    });

    test('10. fails with invalid body', async () => {
      const response = await request(app).post('/api/auth/login').send({ email: 'invalid' });
      expect(response.status).toBe(400);
    });

    test('11. fails when password missing', async () => {
      const response = await request(app).post('/api/auth/login').send({ email: baseUser.email });
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/whoami', () => {
    test('12. fails without token', async () => {
      const response = await request(app).get('/api/auth/whoami');
      expect(response.status).toBe(401);
    });

    test('13. fails with malformed bearer token', async () => {
      const response = await request(app)
        .get('/api/auth/whoami')
        .set('Authorization', 'Bearer invalid.token.value');
      expect(response.status).toBeGreaterThanOrEqual(401);
    });

    test('14. returns current user with token', async () => {
      const response = await request(app)
        .get('/api/auth/whoami')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(baseUser.email);
    });
  });

  describe('PUT /api/auth/update-profile', () => {
    test('15. fails without token', async () => {
      const response = await request(app).put('/api/auth/update-profile').send({ fullname: 'Updated' });
      expect(response.status).toBe(401);
    });

    test('16. updates profile with token', async () => {
      const response = await request(app)
        .put('/api/auth/update-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ fullname: 'Updated Name' });
      expect(response.status).toBe(200);
      expect(response.body.data.fullname).toBe('Updated Name');
    });

    test('17. rejects invalid profile payload', async () => {
      const response = await request(app)
        .put('/api/auth/update-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ phoneNumber: '1' });
      expect(response.status).toBe(400);
    });
  });

  describe('Password Reset + SMS endpoints', () => {
    test('18. sends reset password email for web', async () => {
      const response = await request(app)
        .post('/api/auth/send-reset-password-email')
        .send({ email: baseUser.email, platform: 'web' });
      expect(response.status).toBe(200);
    });

    test('19. sends reset password code for mobile', async () => {
      const response = await request(app)
        .post('/api/auth/send-reset-password-email')
        .send({ email: baseUser.email, platform: 'mobile' });
      expect(response.status).toBe(200);
    });

    test('20. fails reset request when email missing', async () => {
      const response = await request(app).post('/api/auth/send-reset-password-email').send({});
      expect(response.status).toBe(400);
    });

    test('21. opens deep link page when token query exists', async () => {
      const response = await request(app).get('/api/auth/open-reset?token=abc123');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Opening app');
    });

    test('22. rejects open-reset when token missing', async () => {
      const response = await request(app).get('/api/auth/open-reset');
      expect(response.status).toBe(400);
    });

    test('23. rejects reset-password with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password/invalidtoken')
        .send({ newPassword: 'newpass123' });
      expect(response.status).toBe(400);
    });

    test('24. rejects reset-password-with-code when fields missing', async () => {
      const response = await request(app).post('/api/auth/reset-password-with-code').send({
        email: baseUser.email,
      });
      expect(response.status).toBe(400);
    });

    test('25. rejects send-sms with invalid phone format', async () => {
      const response = await request(app).post('/api/auth/send-sms').send({
        to: '9845000000',
        message: 'Hello',
      });
      expect(response.status).toBe(400);
    });

    test('26. sends sms for valid payload', async () => {
      const response = await request(app).post('/api/auth/send-sms').send({
        to: '+9779800000000',
        message: 'Hello test',
      });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
