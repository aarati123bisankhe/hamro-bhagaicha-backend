const mockRepo = {
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getAllUsers: jest.fn(),
};

jest.mock('../../repositories/user.repository', () => ({
  UserRepository: jest.fn().mockImplementation(() => mockRepo),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

import bcryptjs from 'bcryptjs';
import { AdminUserService } from '../../services/admin/user.service';

describe('AdminUserService Unit Tests', () => {
  const service = new AdminUserService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('22. createUser hashes and persists', async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed');
    mockRepo.createUser.mockResolvedValue({ _id: 'u1' });

    await service.createUser({ email: 'a@example.com', password: 'pass1234' } as any);
    expect(mockRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashed' }));
  });

  test('23. createUser rejects duplicate email', async () => {
    mockRepo.getUserByEmail.mockResolvedValue({ _id: 'u1' });
    await expect(service.createUser({ email: 'a@example.com', password: 'pass1234' } as any)).rejects.toMatchObject({ statusCode: 409 });
  });

  test('24. getUserById returns user', async () => {
    mockRepo.getUserById.mockResolvedValue({ _id: 'u1' });
    await expect(service.getUserById('u1')).resolves.toEqual({ _id: 'u1' });
  });

  test('25. getUserById throws 404 when missing', async () => {
    mockRepo.getUserById.mockResolvedValue(null);
    await expect(service.getUserById('u1')).rejects.toMatchObject({ statusCode: 404 });
  });

  test('26. deleteOneUser throws 404 when missing', async () => {
    mockRepo.getUserById.mockResolvedValue(null);
    await expect(service.deleteOneUser('u1')).rejects.toMatchObject({ statusCode: 404 });
  });

  test('27. deleteOneUser throws 500 when delete fails', async () => {
    mockRepo.getUserById.mockResolvedValue({ _id: 'u1' });
    mockRepo.deleteUser.mockResolvedValue(false);
    await expect(service.deleteOneUser('u1')).rejects.toMatchObject({ statusCode: 500 });
  });

  test('28. deleteOneUser returns true on success', async () => {
    mockRepo.getUserById.mockResolvedValue({ _id: 'u1' });
    mockRepo.deleteUser.mockResolvedValue(true);
    await expect(service.deleteOneUser('u1')).resolves.toBe(true);
  });

  test('29. updateOneUser throws 404 when missing', async () => {
    mockRepo.getUserById.mockResolvedValue(null);
    await expect(service.updateOneUser('u1', { fullname: 'X' } as any)).rejects.toMatchObject({ statusCode: 404 });
  });

  test('30. updateOneUser throws 500 when update returns null', async () => {
    mockRepo.getUserById.mockResolvedValue({ _id: 'u1' });
    mockRepo.updateUser.mockResolvedValue(null);
    await expect(service.updateOneUser('u1', { fullname: 'X' } as any)).rejects.toMatchObject({ statusCode: 500 });
  });

  test('31. updateOneUser returns updated user', async () => {
    mockRepo.getUserById.mockResolvedValue({ _id: 'u1' });
    mockRepo.updateUser.mockResolvedValue({ _id: 'u1', fullname: 'X' });
    await expect(service.updateOneUser('u1', { fullname: 'X' } as any)).resolves.toEqual({ _id: 'u1', fullname: 'X' });
  });

  test('32. getAllUsers delegates pagination', async () => {
    const payload = { users: [{ _id: 'u1' }], pagination: { page: 1 } };
    mockRepo.getAllUsers.mockResolvedValue(payload);
    await expect(service.getAllUsers(1, 10)).resolves.toEqual(payload as any);
    expect(mockRepo.getAllUsers).toHaveBeenCalledWith(1, 10);
  });
});
