const mockRepo = {
  getUserById: jest.fn(),
};

jest.mock('../../repositories/user.repository', () => ({
  UserRepository: jest.fn().mockImplementation(() => mockRepo),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

import jwt from 'jsonwebtoken';
import { authorizedMiddleware, adminMiddleware } from '../../middlewares/authorized_middleware';

const createRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Middleware Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('53. authorizedMiddleware rejects missing auth header', async () => {
    const req: any = { headers: {} };
    const res = createRes();
    const next = jest.fn();

    await authorizedMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('54. authorizedMiddleware rejects non-bearer auth', async () => {
    const req: any = { headers: { authorization: 'Token abc' } };
    const res = createRes();
    const next = jest.fn();

    await authorizedMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('55. authorizedMiddleware rejects empty bearer token', async () => {
    const req: any = { headers: { authorization: 'Bearer ' } };
    const res = createRes();
    const next = jest.fn();

    await authorizedMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('56. authorizedMiddleware rejects missing decoded id', async () => {
    const req: any = { headers: { authorization: 'Bearer abc' } };
    const res = createRes();
    const next = jest.fn();
    (jwt.verify as jest.Mock).mockReturnValue({});

    await authorizedMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('57. authorizedMiddleware rejects unknown user', async () => {
    const req: any = { headers: { authorization: 'Bearer abc' } };
    const res = createRes();
    const next = jest.fn();
    (jwt.verify as jest.Mock).mockReturnValue({ id: 'u1' });
    mockRepo.getUserById.mockResolvedValue(null);

    await authorizedMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('58. authorizedMiddleware attaches user and calls next', async () => {
    const req: any = { headers: { authorization: 'Bearer abc' } };
    const res = createRes();
    const next = jest.fn();
    (jwt.verify as jest.Mock).mockReturnValue({ id: 'u1' });
    mockRepo.getUserById.mockResolvedValue({ _id: 'u1', role: 'user' });

    await authorizedMiddleware(req, res, next);
    expect(req.user).toEqual({ _id: 'u1', role: 'user' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('59. authorizedMiddleware handles jwt verification error', async () => {
    const req: any = { headers: { authorization: 'Bearer abc' } };
    const res = createRes();
    const next = jest.fn();
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('bad token');
    });

    await authorizedMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('60. adminMiddleware rejects when req.user missing', async () => {
    const req: any = {};
    const res = createRes();
    const next = jest.fn();

    await adminMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('61. adminMiddleware rejects non-admin role', async () => {
    const req: any = { user: { role: 'user' } };
    const res = createRes();
    const next = jest.fn();

    await adminMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('62. adminMiddleware calls next for admin', async () => {
    const req: any = { user: { role: 'admin' } };
    const res = createRes();
    const next = jest.fn();

    await adminMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
