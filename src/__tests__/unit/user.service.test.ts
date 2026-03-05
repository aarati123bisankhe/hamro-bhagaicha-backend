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
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('../../configs/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import crypto from 'crypto';
import { UserService } from '../../services/user.service';
import { HttpError } from '../../errors/http-error';
import { sendEmail } from '../../configs/email';

describe('UserService Unit Tests', () => {
  const service = new UserService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('1. getUserById returns user', async () => {
    mockRepo.getUserById.mockResolvedValue({ _id: 'u1' });
    await expect(service.getUserById('u1')).resolves.toEqual({ _id: 'u1' });
  });

  test('2. getUserById throws 404 when missing', async () => {
    mockRepo.getUserById.mockResolvedValue(null);
    await expect(service.getUserById('u1')).rejects.toMatchObject({ statusCode: 404 });
  });

  test('3. registerUser creates with hashed password', async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed');
    mockRepo.createUser.mockResolvedValue({ _id: 'u2' });

    await service.registerUser({
      fullname: 'A',
      email: 'a@example.com',
      password: 'password123',
      address: 'ktm',
      phoneNumber: '9845',
    } as any);

    expect(mockRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashed' }));
  });

  test('4. registerUser rejects duplicate email', async () => {
    mockRepo.getUserByEmail.mockResolvedValue({ _id: 'u1' });
    await expect(
      service.registerUser({ email: 'a@example.com', password: 'password123' } as any)
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test('5. loginUser returns token for valid credentials', async () => {
    mockRepo.getUserByEmail.mockResolvedValue({ _id: 'u1', email: 'a@example.com', password: 'hashed', role: 'user' });
    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('token-1');

    const result = await service.loginUser({ email: 'a@example.com', password: 'password123' });
    expect(result.token).toBe('token-1');
  });

  test('6. loginUser throws 404 when user missing', async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);
    await expect(service.loginUser({ email: 'a@example.com', password: 'p' } as any)).rejects.toMatchObject({ statusCode: 404 });
  });

  test('7. loginUser throws 401 when password invalid', async () => {
    mockRepo.getUserByEmail.mockResolvedValue({ _id: 'u1', password: 'hashed' });
    (bcryptjs.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.loginUser({ email: 'a@example.com', password: 'bad' } as any)).rejects.toMatchObject({ statusCode: 401 });
  });

  test('8. updateUser throws 404 when user missing', async () => {
    mockRepo.getUserById.mockResolvedValue(null);
    await expect(service.updateUser('u1', {} as any)).rejects.toMatchObject({ statusCode: 404 });
  });

  test('9. updateUser rejects email collision', async () => {
    mockRepo.getUserById.mockResolvedValue({ _id: 'u1', email: 'old@example.com' });
    mockRepo.getUserByEmail.mockResolvedValue({ _id: 'u2' });

    await expect(service.updateUser('u1', { email: 'new@example.com' } as any)).rejects.toMatchObject({ statusCode: 409 });
  });

  test('10. updateUser hashes password when provided', async () => {
    mockRepo.getUserById.mockResolvedValue({ _id: 'u1', email: 'a@example.com' });
    mockRepo.getUserByEmail.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue('new-hash');
    mockRepo.updateUser.mockResolvedValue({ _id: 'u1', password: 'new-hash' });

    await service.updateUser('u1', { email: 'a@example.com', password: 'new' } as any);
    expect(mockRepo.updateUser).toHaveBeenCalledWith('u1', expect.objectContaining({ password: 'new-hash' }));
  });

  test('11. updateUser removes old profile image when exists', async () => {
    mockRepo.getUserById.mockResolvedValue({ _id: 'u1', email: 'a@example.com', profileUrl: 'old.png' });
    mockRepo.getUserByEmail.mockResolvedValue(null);
    mockRepo.updateUser.mockResolvedValue({ _id: 'u1' });
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    await service.updateUser(
      'u1',
      { email: 'a@example.com' } as any,
      { profileUrl: [{ filename: 'new.png' }] } as any
    );

    expect(fs.unlinkSync).toHaveBeenCalled();
  });

  test('12. sendResetPasswordEmail throws 400 when email missing', async () => {
    await expect(service.sendResetPasswordEmail(undefined)).rejects.toMatchObject({ statusCode: 400 });
  });

  test('13. sendResetPasswordEmail throws 404 when user missing', async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);
    await expect(service.sendResetPasswordEmail('missing@example.com')).rejects.toMatchObject({ statusCode: 404 });
  });

  test('14. sendResetPasswordEmail web sends email', async () => {
    mockRepo.getUserByEmail.mockResolvedValue({ _id: 'u1', email: 'a@example.com' });
    (jwt.sign as jest.Mock).mockReturnValue('jwt-token');

    await service.sendResetPasswordEmail('a@example.com', 'web');
    expect(sendEmail).toHaveBeenCalled();
  });

  test('15. sendResetPasswordEmail mobile sets code fields and emails', async () => {
    mockRepo.getUserByEmail.mockResolvedValue({ _id: 'u1', email: 'a@example.com' });
    (jwt.sign as jest.Mock).mockReturnValue('jwt-token');

    await service.sendResetPasswordEmail('a@example.com', 'mobile');
    expect(mockRepo.updateUser).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ resetPasswordCodeAttempts: 0 })
    );
    expect(sendEmail).toHaveBeenCalled();
  });

  test('16. resetPasswordWithCode rejects missing fields', async () => {
    await expect(service.resetPasswordWithCode(undefined, '111111', 'new')).rejects.toMatchObject({ statusCode: 400 });
  });

  test('17. resetPasswordWithCode rejects too many attempts', async () => {
    mockRepo.getUserByEmail.mockResolvedValue({
      _id: 'u1',
      email: 'a@example.com',
      resetPasswordCodeHash: 'hash',
      resetPasswordCodeExpiresAt: new Date(Date.now() + 10000),
      resetPasswordCodeAttempts: 5,
    });

    await expect(service.resetPasswordWithCode('a@example.com', '111111', 'new123456')).rejects.toMatchObject({ statusCode: 429 });
  });

  test('18. resetPasswordWithCode increments attempts on wrong code', async () => {
    const expectedHash = crypto.createHash('sha256').update('222222').digest('hex');
    mockRepo.getUserByEmail.mockResolvedValue({
      _id: 'u1',
      email: 'a@example.com',
      resetPasswordCodeHash: expectedHash,
      resetPasswordCodeExpiresAt: new Date(Date.now() + 10000),
      resetPasswordCodeAttempts: 1,
    });

    await expect(service.resetPasswordWithCode('a@example.com', '111111', 'new123456')).rejects.toMatchObject({ statusCode: 400 });
    expect(mockRepo.updateUser).toHaveBeenCalledWith('u1', expect.objectContaining({ resetPasswordCodeAttempts: 2 }));
  });

  test('19. resetPasswordWithCode updates password when code valid', async () => {
    const code = '111111';
    const expectedHash = crypto.createHash('sha256').update(code).digest('hex');

    mockRepo.getUserByEmail.mockResolvedValue({
      _id: 'u1',
      email: 'a@example.com',
      resetPasswordCodeHash: expectedHash,
      resetPasswordCodeExpiresAt: new Date(Date.now() + 10000),
      resetPasswordCodeAttempts: 0,
    });
    (bcryptjs.hash as jest.Mock).mockResolvedValue('new-hash');

    await service.resetPasswordWithCode('a@example.com', code, 'new123456');
    expect(mockRepo.updateUser).toHaveBeenCalledWith('u1', expect.objectContaining({ password: 'new-hash' }));
  });

  test('20. resetPassword rejects invalid token', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(service.resetPassword('bad-token', 'new')).rejects.toMatchObject({ statusCode: 400 });
  });

  test('21. resetPassword updates password with valid token', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 'u1' });
    mockRepo.getUserById.mockResolvedValue({ _id: 'u1' });
    (bcryptjs.hash as jest.Mock).mockResolvedValue('new-hash');

    await service.resetPassword('good-token', 'newpass');
    expect(mockRepo.updateUser).toHaveBeenCalledWith('u1', { password: 'new-hash' });
  });
});
