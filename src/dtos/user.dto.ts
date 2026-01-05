import z, { email } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDto = UserSchema.pick(
    {
        firstName: true,
        // lastName: true,
        username: true,
        email: true,
        password: true
    }

).extend(
    {
        confirmPassword: z.string().min(6),
        address: z.string().min(3, "Address is required"),
        phoneNumber: z.string().min(10, "Phone number is required"),
        
    }
).refine(
(data) => data.password === data.confirmPassword,
{
    message: "password do not match",
    path: ["confirm password"] //set the path of the error to "confirm password"
}
)
export type CreateUserDto = z.infer<typeof CreateUserDto>;

//export const updateUserDto = userscheme.partial(). //all optional fields
export const updateUserDto = UserSchema.pick(
    {
        firstName: true,
        // lastName: true,
        username: true,
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


