import z, { email } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDto = UserSchema.pick(
    {
        fullname: true,
        email: true,
        password: true
    }

).extend(
    {
        address: z.string().min(3, "Address is required"),
        phoneNumber: z.string().min(10, "Phone number is required"),
        
    }
);
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const updateUserDto = UserSchema.pick(
    {
        fullname: true,
        email: true
    }

)

.extend({
    address: z.string().min(3).optional(),
    phoneNumber: z.string().min(10).optional(),
  });

export type updateUserDto = z.infer<typeof updateUserDto>;


export const LoginUserDto = z.object({
    email: z.email(),
    password: z.string(). min(6)
})
export type LoginUserDto = z.infer<typeof LoginUserDto>


export const UpdateUserDto = UserSchema.partial();
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;



