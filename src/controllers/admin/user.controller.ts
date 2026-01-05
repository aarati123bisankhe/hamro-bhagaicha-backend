import z, { success } from "zod";
import { Request, Response } from "express";
import { AdminUserService } from "../../services/admin/user.service";
import { CreateUserDto } from "../../dtos/user.dto";

let adminuserService = new AdminUserService();
export class AdminUserController {
    async createUser(req: Request, res: Response) {
        try {
        const userData: CreateUserDto = req.body;
        const user = await adminuserService.createUser(userData);
        return res.status(201).json({
            success: true,
            data: user,
            message: "Admin user created successfully"
        });
    } catch (error: any) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
        //similar to registser user
    }
    async getOneUser(req: Request, res:Response){
        try{
            const userId = req.params.id; //eg: /api/admin/users/:id
            const user = await adminuserService.getOneUser(userId);
            return res.status(200).json(
                {success: true, data: user, message: "user fetvhed"}
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                {success: false, message:error.message || "internal server error"}
            )
        }
    }
    // continue to other
}