import { UserRepository } from "../../repositories/user.repository";
import { CreateUserDto, updateUserDto } from "../../dtos/user.dto";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";
let userRepository = new UserRepository();
export class AdminUserService {
    async createUser(userData: CreateUserDto){
        // Check if user/email exists
    const existingUser = await userRepository.getUserByEmail(userData.email);
    if (existingUser) {
        throw new HttpError(400, "Email already exists");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(userData.password, 10);

    const newUser = await userRepository.createUser({
        ...userData,
        password: hashedPassword,
        role: "admin", // make this user an admin
    });

    return newUser;
        //sams as registeruser
    }
    async getOneUser(userId: string){
        const user = await userRepository.getUserById(userId);
        if(!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }
    async deleteOneUser(userId: string){
        const user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "user not found");
        }
        const result = await userRepository.deleteUser(userId); //booolean \ null
        if(!result){
            throw new HttpError(500, "failed to delete user");
        }
        return result;
    }

    async updateOneUser(userId: string, updataData: updateUserDto){
        const user =await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "user not found");
        }
        // more logic, check if email exists
        const updatedUser = await userRepository.updateUser(userId, updataData);
        if(!updatedUser){
            throw new HttpError(500, "failed to update user");
        }
        return updatedUser;

    }
}