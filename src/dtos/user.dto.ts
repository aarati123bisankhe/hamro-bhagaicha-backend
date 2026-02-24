import z, { email } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDto = UserSchema.pick(
    {
        fullname: true,
        email: true,
        password: true,
        address:true,
        phoneNumber: true
    }

)
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const LoginUserDto = z.object({
    email: z.email(),
    password: z.string(). min(6)
})
export type LoginUserDto = z.infer<typeof LoginUserDto>


export const UpdateUserDto = UserSchema.partial();
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const SendSmsDto = z.object({
    to: z
        .string()
        .regex(/^\+[1-9]\d{7,14}$/, "Phone number must be in E.164 format, e.g. +97798XXXXXXXX"),
    message: z.string().min(1, "Message is required").max(1600, "Message is too long"),
});
export type SendSmsDto = z.infer<typeof SendSmsDto>;


