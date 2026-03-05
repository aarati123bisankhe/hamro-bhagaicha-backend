import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import bcrypt from 'bcryptjs';

const describeIfMongo = process.env.RUN_INTEGRATION === "true" ? describe : describe.skip;

describeIfMongo('ADMIN CONTROLLER - Integration Tests', () => {
  let adminToken = '';
  let userToken = '';
  let createdUserId = '';

  const seed = Date.now();
  const adminEmail = `admintest_${seed}@example.com`;
  const userEmail = `usertest_${seed}@example.com`;

  beforeAll(async () => {
    await UserModel.deleteMany({ email: { $regex: /.*@example\.com$/ } });

    const hashedPassword = await bcrypt.hash('password123', 10);

    await UserModel.create({
      fullname: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      address: 'Kathmandu',
      phoneNumber: '9845123456',
    });

    await UserModel.create({
      fullname: 'Normal User',
      email: userEmail,
      password: hashedPassword,
      role: 'user',
      address: 'Kathmandu',
      phoneNumber: '9845123457',
    });

    const [adminLogin, normalLogin] = await Promise.all([
      request(app).post('/api/auth/login').send({ email: adminEmail, password: 'password123' }),
      request(app).post('/api/auth/login').send({ email: userEmail, password: 'password123' }),
    ]);

    adminToken = adminLogin.body.token;
    userToken = normalLogin.body.token;
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: { $regex: /.*@example\.com$/ } });
  });

  describe('Admin Access', () => {
    test('27. admin test route works', async () => {
      const res = await request(app)
        .get('/api/admin/users/test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('28. admin route fails without token', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
    });

    test('29. admin route fails with non-admin token', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    test('30. admin route fails for malformed token', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer broken.token');
      expect(res.status).toBeGreaterThanOrEqual(401);
    });
  });

  describe('User Management', () => {
    test('31. admin creates a user', async () => {
      const suffix = Date.now();
      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullname: `New User ${suffix}`,
          email: `new_${suffix}@example.com`,
          password: 'password123',
          address: 'Lalitpur',
          phoneNumber: '9845000011',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toContain('@example.com');
      createdUserId = res.body.data._id;
    });

    test('32. admin create rejects invalid body', async () => {
      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'bad' });

      expect(res.status).toBe(400);
    });

    test('33. admin create rejects duplicate email', async () => {
      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullname: 'Dup User',
          email: adminEmail,
          password: 'password123',
          address: 'Bhaktapur',
          phoneNumber: '9845000012',
        });

      expect(res.status).toBe(409);
    });

    test('34. admin gets all users default pagination', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    test('35. admin gets all users with page/size', async () => {
      const res = await request(app)
        .get('/api/admin/users?page=1&size=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.size).toBe(5);
    });

    test('36. admin clamps invalid pagination values', async () => {
      const res = await request(app)
        .get('/api/admin/users?page=-4&size=1000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.size).toBe(100);
    });

    test('37. admin gets user by id', async () => {
      const res = await request(app)
        .get(`/api/admin/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(createdUserId);
    });

    test('38. admin get user by id fails for unknown id', async () => {
      const res = await request(app)
        .get('/api/admin/users/64b123456789123456789123')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    test('39. admin update user', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ fullname: 'Updated Admin User' });

      expect(res.status).toBe(200);
      expect(res.body.data.fullname).toBe('Updated Admin User');
    });

    test('40. admin update rejects invalid body', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ phoneNumber: '1' });

      expect(res.status).toBe(400);
    });

    test('41. admin update fails unknown user', async () => {
      const res = await request(app)
        .put('/api/admin/users/64b123456789123456789123')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ fullname: 'No User' });

      expect(res.status).toBe(404);
    });

    test('42. admin deletes existing user', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    test('43. admin delete non-existing user returns 404', async () => {
      const res = await request(app)
        .delete('/api/admin/users/64b123456789123456789123')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });
});
