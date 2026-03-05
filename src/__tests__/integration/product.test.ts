import request from 'supertest';
import app from '../../app';

const describeIfMongo = process.env.RUN_INTEGRATION === "true" ? describe : describe.skip;

describeIfMongo('Product Integration Tests', () => {
  const sellerId = `seller_${Date.now()}`;
  const createdIds: string[] = [];

  test('56. adds a product', async () => {
    const res = await request(app).post('/api/seller/products').send({
      sellerId,
      name: 'Rose Plant',
      description: 'Beautiful rose',
      category: 'flower',
      unit: 'pcs',
      price: 100,
      stock: 10,
      imageUrl: 'https://example.com/rose.jpg',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdIds.push(res.body.data.id);
  });

  test('57. adds product with numeric string fields', async () => {
    const res = await request(app).post('/api/seller/products').send({
      sellerId,
      name: 'Tulip',
      price: '150',
      stock: '3',
    });

    expect(res.status).toBe(201);
    createdIds.push(res.body.data.id);
  });

  test('58. rejects add product with missing name', async () => {
    const res = await request(app).post('/api/seller/products').send({
      sellerId,
      price: 100,
      stock: 1,
    });

    expect(res.status).toBe(400);
  });

  test('59. rejects add product with negative price', async () => {
    const res = await request(app).post('/api/seller/products').send({
      sellerId,
      name: 'Bad Product',
      price: -1,
      stock: 1,
    });

    expect(res.status).toBe(400);
  });

  test('60. rejects add product with negative stock', async () => {
    const res = await request(app).post('/api/seller/products').send({
      sellerId,
      name: 'Bad Stock',
      price: 1,
      stock: -2,
    });

    expect(res.status).toBe(400);
  });

  test('61. gets inventory list', async () => {
    const res = await request(app).get('/api/seller/products/inventory');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('62. filters inventory by sellerId', async () => {
    const res = await request(app).get(`/api/seller/products/inventory?sellerId=${sellerId}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.every((p: any) => p.sellerId === sellerId)).toBe(true);
  });

  test('63. filters inventory by search keyword', async () => {
    const res = await request(app).get('/api/seller/products/inventory?search=rose');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('64. deletes an existing product', async () => {
    const id = createdIds.shift();
    const res = await request(app).delete(`/api/seller/products/${id}`);
    expect(res.status).toBe(200);
  });

  test('65. returns 404 for non-existing product', async () => {
    const res = await request(app).delete('/api/seller/products/not-found-product-id');
    expect(res.status).toBe(404);
  });

  test('66. deletes remaining created products', async () => {
    for (const id of createdIds) {
      const res = await request(app).delete(`/api/seller/products/${id}`);
      expect([200, 404]).toContain(res.status);
    }
  });
});
