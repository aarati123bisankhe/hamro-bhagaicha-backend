import {z} from "zod";
import { BookSchema } from "../types/book.type";

export const CreateBookDto = BookSchema.pick({id:true, title:true});
export type CreateBookDto = z.infer<typeof CreateBookDto>;