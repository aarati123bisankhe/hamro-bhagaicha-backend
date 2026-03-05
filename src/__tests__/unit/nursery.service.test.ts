const mockRepo = {
  getNurseries: jest.fn(),
};

jest.mock('../../repositories/nursery.repository', () => ({
  NurseryRepository: jest.fn().mockImplementation(() => mockRepo),
}));

import { NurseryService } from '../../services/nursery.service';

describe('NurseryService Unit Tests', () => {
  const service = new NurseryService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('33. returns repository response when data exists', async () => {
    mockRepo.getNurseries.mockResolvedValue({
      nurseries: [{ _id: '1', name: 'A' }],
      pagination: { page: 1, size: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });

    const result = await service.getNurseries({});
    expect(result.fallback.used).toBe(false);
    expect(result.nurseries.length).toBe(1);
  });

  test('34. returns fallback when repository empty and no search', async () => {
    mockRepo.getNurseries.mockResolvedValue({
      nurseries: [],
      pagination: { page: 1, size: 20, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });

    const result = await service.getNurseries({});
    expect(result.fallback.used).toBe(true);
    expect(result.nurseries.length).toBeGreaterThan(0);
  });

  test('35. does not fallback when search returns empty', async () => {
    mockRepo.getNurseries.mockResolvedValue({
      nurseries: [],
      pagination: { page: 1, size: 20, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });

    const result = await service.getNurseries({ search: 'x' });
    expect(result.fallback.used).toBe(false);
    expect(result.nurseries).toEqual([]);
  });

  test('36. returns fallback when repository throws', async () => {
    mockRepo.getNurseries.mockRejectedValue(new Error('db down'));
    const result = await service.getNurseries({});
    expect(result.fallback.used).toBe(true);
    expect(result.fallback.reason).toContain('fallback');
  });

  test('37. fallback search filters by name', async () => {
    mockRepo.getNurseries.mockRejectedValue(new Error('db down'));
    const result = await service.getNurseries({ search: 'Green Valley' });
    expect(result.nurseries.length).toBe(1);
  });

  test('38. fallback search can return empty', async () => {
    mockRepo.getNurseries.mockRejectedValue(new Error('db down'));
    const result = await service.getNurseries({ search: 'not-found-tag' });
    expect(result.nurseries.length).toBe(0);
  });

  test('39. fallback GPS adds distance', async () => {
    mockRepo.getNurseries.mockRejectedValue(new Error('db down'));
    const result = await service.getNurseries({ lat: 27.71, lng: 85.32, radiusKm: 100 });
    expect(result.nurseries.every((n) => typeof n.distanceKm === 'number')).toBe(true);
  });

  test('40. fallback GPS respects radius filter', async () => {
    mockRepo.getNurseries.mockRejectedValue(new Error('db down'));
    const result = await service.getNurseries({ lat: 27.71, lng: 85.32, radiusKm: 0.5 });
    expect(result.nurseries.length).toBeLessThanOrEqual(2);
  });

  test('41. fallback pagination honors page and size', async () => {
    mockRepo.getNurseries.mockRejectedValue(new Error('db down'));
    const result = await service.getNurseries({ page: 2, size: 1 });
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.size).toBe(1);
    expect(result.nurseries.length).toBeLessThanOrEqual(1);
  });

  test('42. fallback pagination has previous page when page > 1', async () => {
    mockRepo.getNurseries.mockRejectedValue(new Error('db down'));
    const result = await service.getNurseries({ page: 2, size: 1 });
    expect(result.pagination.hasPreviousPage).toBe(true);
  });

  test('43. defaults page and size when omitted', async () => {
    mockRepo.getNurseries.mockResolvedValue({
      nurseries: [{ _id: '1', name: 'A' }],
      pagination: { page: 1, size: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });

    await service.getNurseries({});
    expect(mockRepo.getNurseries).toHaveBeenCalledWith(expect.objectContaining({ page: 1, size: 20 }));
  });

  test('44. forwards search and location params to repository', async () => {
    mockRepo.getNurseries.mockResolvedValue({
      nurseries: [{ _id: '1', name: 'A' }],
      pagination: { page: 1, size: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });

    await service.getNurseries({ search: 'abc', lat: 1, lng: 2, radiusKm: 3 });
    expect(mockRepo.getNurseries).toHaveBeenCalledWith(expect.objectContaining({ search: 'abc', lat: 1, lng: 2, radiusKm: 3 }));
  });
});
