import z from "zod";

export const UserSchema = z.object({
    fullname: z.string().optional(),
    email: z.email(),
    password: z.string().min(6),
    address: z.string().min(3, "Address is required"),
    phoneNumber: z.string().min(10, "Phone number is required"),
    role: z.enum(["user","admin"]).default('user'),
    profileUrl: z.string().optional(),
})

export type UserType = z.infer<typeof UserSchema>;

