import { UserModel, IUser } from "../models/user.model";

export interface UsersPaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedUsersResponse {
  users: IUser[];
  pagination: UsersPaginationMeta;
}

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>;
  //  getUserByUsername(username: string): Promise<IUser | null>;

  // Common database methods
  createUser(userData: Partial<IUser>): Promise<IUser>;
  getUserById(userId: string): Promise<IUser | null>;
  getAllUsers(page: number, size: number): Promise<PaginatedUsersResponse>;
  updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(userId: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    await user.save();
    return user;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async getUserById(userId: string): Promise<IUser | null> {
    return await UserModel.findById(userId);
  }

  async getAllUsers(page: number, size: number): Promise<PaginatedUsersResponse> {
    const skip = (page - 1) * size;
    const [users, total] = await Promise.all([
      UserModel.find().sort({ createdAt: -1 }).skip(skip).limit(size),
      UserModel.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / size) || 1;
    return {
      users,
      pagination: {
        page,
        size,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  //  async getUserByUsername(username: string): Promise<IUser | null> {
  //       const user = await UserModel.findOne({"username": username});
  //       return user;
  //   }

  async updateUser(
    userId: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(userId);
    return !!result;
  }
}
