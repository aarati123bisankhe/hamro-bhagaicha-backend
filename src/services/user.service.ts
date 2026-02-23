import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs";
import path from "path";
import fs from "fs";
import { sendEmail } from "../configs/email";

let userRepository = new UserRepository();
export class UserService{
    getUserById(userId: any) {
        throw new Error("Method not implemented.");
    }
    async registerUser(userData: CreateUserDto){
       const checkEmail = await userRepository.getUserByEmail(userData.email);
        if(checkEmail){
            throw new HttpError(409, "email already in use");
        }
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
    const payload = { 
        id: user._id,
        email: user.email,
        role: user.role
        }
        const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "30d"}); 
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

    

    async sendResetPasswordEmail(
      email?: string,
      platform: "web" | "mobile" = "web",
      resetUrl?: string
    ) {
        if (!email) throw new HttpError(400, "Email is required");

        const user = await userRepository.getUserByEmail(email);
        if (!user) throw new HttpError(404, "User not found");

        // Generate JWT token valid for 1 hour
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

        let resetBaseUrl: string;

        if (platform === "mobile") {
            // For Flutter/app links, allow explicit resetUrl from client first.
            resetBaseUrl =
            resetUrl ||
            process.env.MOBILE_RESET_URL ||
            `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password`;
        } else {
            // Web link stays the same
            const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
            resetBaseUrl = `${CLIENT_URL}/reset-password`;
        }

        const separator = resetBaseUrl.includes("?") ? "&" : "?";
        const resetLink = `${resetBaseUrl}${separator}token=${encodeURIComponent(token)}`;

        const html = `
            <p>Click "<a href="${resetLink}">${resetLink}</a>" to reset your password.</p>
            <p>If your app or email client does not open links, copy the link and paste it into your browser URL.</p>
            <p>This link will expire in 1 hour.</p>
        `;

        const text = `Reset your password using this link (expires in 1 hour): ${resetLink}
                        If the link does not open, copy and paste it into your browser URL.`;

        await sendEmail(user.email, "Password Reset", html, text);
        return user;
    }


  /**
   * Reset user password
   */
  async resetPassword(token?: string, newPassword?: string) {
    if (!token || !newPassword) throw new HttpError(400, "Token and new password are required");

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;
      const user = await userRepository.getUserById(userId);
      if (!user) throw new HttpError(404, "User not found");

      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      await userRepository.updateUser(userId, { password: hashedPassword });

      return user;
    } catch (err) {
      throw new HttpError(400, "Invalid or expired token");
    }
  }
}

