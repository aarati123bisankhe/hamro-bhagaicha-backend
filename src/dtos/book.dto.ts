import {z} from "zod";
import { BookSchema } from "../types/book.type";

//DTO - Data Transfer Object
export const CreateBookDto = BookSchema.pick({id:true, title:true});
export type CreateBookDto = z.infer<typeof CreateBookDto>;
//zod has many functions like pick, omit, partial, etc to create new schemas from existing schemas