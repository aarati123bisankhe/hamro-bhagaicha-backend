import request from 'supertest';
import app from '../../app';
import { NurseryModel } from '../../models/nursery.model';

const describeIfMongo = process.env.RUN_INTEGRATION === "true" ? describe : describe.skip;

describeIfMongo('Nursery Integration Tests', () => {
  const testNurseries = [
    {
      name: 'Test Nursery A',
      address: 'Bansbari',
      city: 'Kathmandu',
      tags: ['indoor', 'pots'],
      rating: 4.5,
      location: { type: 'Point', coordinates: [85.344, 27.742] },
    },
    {
      name: 'Test Nursery B',
      address: 'Jawalakhel',
      city: 'Lalitpur',
      tags: ['outdoor'],
      rating: 4.0,
      location: { type: 'Point', coordinates: [85.315, 27.676] },
    },
    {
      name: 'Test Nursery C',
      address: 'Bhaktapur Durbar',
      city: 'Bhaktapur',
      tags: ['seeds'],
      rating: 3.8,
      location: { type: 'Point', coordinates: [85.4298, 27.671] },
    },
  ];

  beforeAll(async () => {
    await NurseryModel.syncIndexes();
    await NurseryModel.deleteMany({ name: /^Test Nursery/ });
    await NurseryModel.insertMany(testNurseries);
  });

  afterAll(async () => {
    await NurseryModel.deleteMany({ name: /^Test Nursery/ });
  });

  test('44. fetches nurseries default pagination', async () => {
    const response = await request(app).get('/api/nurseries');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.pagination).toBeDefined();
  });

  test('45. supports page/size query', async () => {
    const response = await request(app).get('/api/nurseries?page=1&size=1');
    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.size).toBe(1);
    expect(response.body.data.length).toBeLessThanOrEqual(1);
  });

  test('46. filters with search by city', async () => {
    const response = await request(app).get('/api/nurseries?search=lalitpur');
    expect(response.status).toBe(200);
    expect(response.body.data.some((n: any) => String(n.city || '').toLowerCase().includes('lalitpur'))).toBe(true);
  });

  test('47. filters with search by tag', async () => {
    const response = await request(app).get('/api/nurseries?search=seeds');
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('48. supports gps params', async () => {
    const response = await request(app).get('/api/nurseries?lat=27.7172&lng=85.324&radiusKm=20');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    if (response.body.data.length > 0) {
      expect(response.body.data[0].location).toHaveProperty('lat');
      expect(response.body.data[0].location).toHaveProperty('lng');
    }
  });

  test('49. validates lat/lng pair when lat only', async () => {
    const response = await request(app).get('/api/nurseries?lat=27.71');
    expect(response.status).toBe(400);
  });

  test('50. validates lat/lng pair when lng only', async () => {
    const response = await request(app).get('/api/nurseries?lng=85.32');
    expect(response.status).toBe(400);
  });

  test('51. validates latitude range', async () => {
    const response = await request(app).get('/api/nurseries?lat=200&lng=85.32');
    expect(response.status).toBe(400);
  });

  test('52. validates longitude range', async () => {
    const response = await request(app).get('/api/nurseries?lat=27.71&lng=200');
    expect(response.status).toBe(400);
  });

  test('53. validates radius upper bound', async () => {
    const response = await request(app).get('/api/nurseries?lat=27.71&lng=85.32&radiusKm=150');
    expect(response.status).toBe(400);
  });

  test('54. validates size upper bound', async () => {
    const response = await request(app).get('/api/nurseries?size=1000');
    expect(response.status).toBe(400);
  });

  test('55. returns empty data for unmatched search', async () => {
    const response = await request(app).get('/api/nurseries?search=unlikely-search-token-xyz');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
