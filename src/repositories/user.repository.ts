// import { promises } from "dns";
// import { UserModel, IUser } from "../models/user.model";
// export interface IUserRepository {
    
//     getUserByEmail(email: string): Promise<IUser | null>;
//     getUserByUsername(username: string): Promise<IUser | null>;
//     // 5 common database methods
//     createUser(userData: Partial<IUser>): Promise<IUser>;
//     getUserById(userId: String):Promise<IUser | null>;
//     getAllUsers(): Promise<IUser[]>; // pagination later
//     updateUser(userId: string, updataData: Partial<IUser>): Promise<IUser | null>;
//     deleteUser(userId: String): Promise<boolean | null>;
// }
// export class UserRepository implements IUserRepository {
//     async createUser(userData: Partial<IUser>): Promise<IUser> {
//         const user = new UserModel(userData);
//         await user.save(); // same as db.users.insertOne()
//         return user;
//     }
//     async getUserByEmail(email: string): Promise<IUser | null> {
//         const user = await UserModel.findOne({ "email" : email });
//         return user;
//     }
//     async getUserByUsername(username: string): Promise<IUser | null> {
//         const user = await UserModel.findOne({ "username" : username });
//         return user;
//     }

//     async getUserById(userId: String): Promise<IUser | null> {
//         const users = await UserModel.findById(userId);
//         return users;
//     }
//     async getAllUsers(): Promise<IUser[]> {
//         const users = await UserModel.find();
//         return users;
//     }
//     async updateUser(userId: string, updataData: Partial<IUser>): Promise<IUser | null> {
//         const updatedUser = await UserModel.findByIdAndUpdate(
//             userId,
//             updataData,
//             {new: true} 
//         );
//         return updatedUser
//     }
//     async deleteUser(userId: String): Promise<boolean | null> {
//         const result = await UserModel.findByIdAndDelete(userId);
//         return result? true: false;
//     }
// }


import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>;
  //  getUserByUsername(username: string): Promise<IUser | null>;

  // Common database methods
  createUser(userData: Partial<IUser>): Promise<IUser>;
  getUserById(userId: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
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

  async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find();
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
