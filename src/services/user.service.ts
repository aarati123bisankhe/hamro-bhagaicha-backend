import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs";
import path from "path";
import fs from "fs";

let userRepository = new UserRepository();
export class UserService{
    getUserById(userId: any) {
        throw new Error("Method not implemented.");
    }
    async registerUser(userData: CreateUserDto){
        // bussiness logic =, e.g chech if user exits, hash password, etc
       const checkEmail = await userRepository.getUserByEmail(userData.email);
        if(checkEmail){
            throw new HttpError(409, "email already in use");
        }
        // const checkUsername = await userRepository.getUserByUsername(userData.email); 
        // if(checkUsername){
        //     throw new HttpError(403, "username alreadyyis used");
        // }
        //donot store plain password - hasg/encrypt for securoty
        const hashedPassword = await bcryptjs.hash(userData.password, 10);
        userData.password = hashedPassword; //replace with hased password
        const newUser = await userRepository.createUser(userData);
        return newUser;
        
    }
    async loginUser(loginData: LoginUserDto){
    const user = await userRepository.getUserByEmail(loginData.email);
    if(!user){
        throw new HttpError(404, "user not found");
    }
    const validPassword = await bcryptjs.compare(loginData.password, user.password);
    if(!validPassword){
        throw new HttpError(401, "invalid credentials")
    }
    const payload = { // what to store in token
        id: user._id,
        email: user.email,
        role: user.role
        }
        const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "30d"}); //30 DAYS
        return {token, user}
}
async updateUser(userId: string, 
    data: UpdateUserDto,
    files?: {
        profileUrl?:Express.Multer.File[]
    }
) { 
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        if(files?.profileUrl?.[0]){
            if(user.profileUrl){
                const oldImagePath = path.resolve(
                    process.cwd(),"uploads",user.profileUrl
                );

                if(fs.existsSync(oldImagePath)){
                    fs.unlinkSync(oldImagePath);
                }
            }

            data.profileUrl = files.profileUrl[0].filename;
        }

        if(user.email !== data.email){
            const checkEmail = await userRepository.getUserByEmail(data.email!);
            if(checkEmail){
                throw new HttpError(409, "Email already in use");
            }
        }

        if(data.password){
            const hashedPassword = await bcryptjs.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateUser(userId, data);
        return updatedUser;
    }
}

