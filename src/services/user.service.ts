import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { CreateUserDto, LoginUserDto } from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs";

let userRepository = new UserRepository();
export class UserService{
    async registerUser(userData: CreateUserDto){
        // bussiness logic =, e.g chech if user exits, hash password, etc
       const checkEmail = await userRepository.getUserByEmail(userData.email);
        if(checkEmail){
            throw new HttpError(409, "email already in use");
        }
        const checkUsername = await userRepository.getUserByUsername(userData.username); 
        if(checkUsername){
            throw new HttpError(403, "username alreadyyis used");
        }
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
}

