// import z, { success } from "zod";
// import { Request, Response } from "express";
// import { AdminUserService } from "../../services/admin/user.service";
// import { CreateUserDto } from "../../dtos/user.dto";

// let adminuserService = new AdminUserService();
// export class AdminUserController {
//     async createUser(req: Request, res: Response) {
//         try {
//         const userData: CreateUserDto = req.body;
//         const user = await adminuserService.createUser(userData);
//         return res.status(201).json({
//             success: true,
//             data: user,
//             message: "Admin user created successfully"
//         });
//     } catch (error: any) {
//         return res.status(error.statusCode || 500).json({
//             success: false,
//             message: error.message
//         });
//     }
//     }
//     async getOneUser(req: Request, res:Response){
//         try{
//             const userId = req.params.id;
//             const user = await adminuserService.getOneUser(userId);
//             return res.status(200).json(
//                 {success: true, data: user, message: "user fetvhed"}
//             )
//         }catch(error: Error | any){
//             return res.status(error.statusCode || 500).json(
//                 {success: false, message:error.message || "internal server error"}
//             )
//         }
//     }
// }


import { NextFunction, Request, Response } from "express";
import z, { success } from "zod";
import { CreateUserDto,UpdateUserDto } from "../../dtos/user.dto";
import { AdminUserService } from "../../services/admin/user.service";

let adminUserService = new AdminUserService();
export class AdminUserController{

    async createUser(req: Request, res: Response){
        try{
        const parsedData = CreateUserDto.safeParse(req.body);
        if(!parsedData.success){
            return res.status(400).json(
                {success: false, message : z.prettifyError(parsedData.error)}
            )
        }
        const newUser = await adminUserService.createUser(parsedData.data);
        return res.status(201).json(
            {success: true, message: 'Register Successful', data: newUser}
        )
        }catch(error: Error | any){
            return res.status(error.status || 500).json(
                {success: false, message: error.message || "Internal Server Error"}
            )
        }
    }

    async getUserById(req: Request, res: Response){
        try{
            const userId =  req.params.id; 
            const user = await adminUserService.getUserById(userId);
            return res.status(200).json(
                {success: true, data: user, message: "User fetched"}
            )
        } catch(error:Error |any){
            return res.status(error.statusCode || 500).json(
                {success: false,message: error.message || "Internal Server Error"}
            )
        }
    }

    async getAllUser(req:Request, res:Response){
        try{
            const users = await adminUserService.getAllUsers();
            return res.status(200).json(
                {success: true,data: users, message: "All users Retrieved"}
            );
        }catch(error: Error | any){
            return res.status(error.statusCode ?? 500).json(
                {success: false, message: error.message || "Internal Server Error"}
            )
        }
    }

    async updateUser(req: Request, res: Response){
        try{
            const userId = req.params.id;
            const parsedData = UpdateUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    {success: false, message:z.prettifyError(parsedData.error)}
                )
            }

            const updateData: UpdateUserDto ={...parsedData.data};
            
            const files = req.files as | { [fieldname: string]: Express.Multer.File[]} | undefined;

            if(files?.profileUrl?.[0]){
                updateData.profileUrl = files.profileUrl[0].filename;
            }

            const updatedUser = await adminUserService.updateOneUser(userId,updateData);

            return res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: updatedUser
            });
        }catch(error: Error | any){
            return res.status(error.statusCode ?? 500).json(
                {success: false,message: error.message || "Internal Server Error"}
            );
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction){
        try{
            const userId = req.params.id;
            const deleted = await adminUserService.deleteOneUser(userId);
            if(!deleted){
                return res.status(404).json(
                    {success: false, message: "User not found"}
                );
            }
            return res.status(200).json(
                {success: true, message: "User Deleted"}
            );
        } catch (error: Error | any){
            return res.status(error.statusCode ?? 500).json(
                {success: false, message: error.message || "Internal Server Error"}
            )
        }
    }

}