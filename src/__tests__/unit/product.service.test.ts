const mockRepository = {
  create: jest.fn(),
  getInventory: jest.fn(),
  deleteById: jest.fn(),
};

jest.mock('../../repositories/product.repository', () => ({
  productRepository: mockRepository,
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-1'),
}));

import { ProductService } from '../../services/product.service';

describe('ProductService Unit Tests', () => {
  const service = new ProductService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('45. addProduct builds and persists product', async () => {
    mockRepository.create.mockResolvedValue({ id: 'uuid-1' });

    await service.addProduct({
      sellerId: 'seller-1',
      name: 'Rose',
      description: 'desc',
      category: 'flower',
      unit: 'pcs',
      price: 10,
      stock: 5,
      imageUrl: 'img',
    });

    expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({ id: 'uuid-1', name: 'Rose' }));
  });

  test('46. addProduct sets createdAt and updatedAt', async () => {
    mockRepository.create.mockResolvedValue({ id: 'uuid-1' });

    await service.addProduct({ sellerId: 's', name: 'N', price: 1, stock: 0 } as any);
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ createdAt: expect.any(String), updatedAt: expect.any(String) })
    );
  });

  test('47. addProduct forwards repository result', async () => {
    mockRepository.create.mockResolvedValue({ id: 'uuid-1', name: 'Rose' });
    const result = await service.addProduct({ sellerId: 's', name: 'N', price: 1, stock: 0 } as any);
    expect(result).toEqual({ id: 'uuid-1', name: 'Rose' });
  });

  test('48. getInventory forwards query to repository', async () => {
    mockRepository.getInventory.mockResolvedValue([]);
    await service.getInventory({ sellerId: 's1', search: 'rose' });
    expect(mockRepository.getInventory).toHaveBeenCalledWith({ sellerId: 's1', search: 'rose' });
  });

  test('49. getInventory returns repository data', async () => {
    mockRepository.getInventory.mockResolvedValue([{ id: '1' }]);
    const result = await service.getInventory({});
    expect(result).toEqual([{ id: '1' }]);
  });

  test('50. deleteProduct returns true when removed', async () => {
    mockRepository.deleteById.mockResolvedValue(true);
    await expect(service.deleteProduct('p1')).resolves.toBe(true);
  });

  test('51. deleteProduct returns false when missing', async () => {
    mockRepository.deleteById.mockResolvedValue(false);
    await expect(service.deleteProduct('p1')).resolves.toBe(false);
  });

  test('52. deleteProduct calls repository with id', async () => {
    mockRepository.deleteById.mockResolvedValue(true);
    await service.deleteProduct('p2');
    expect(mockRepository.deleteById).toHaveBeenCalledWith('p2');
  });
});
