import { Request, Response }  from "express";
import { Book } from "../types/book.type";
import { CreateBookDto } from "../dtos/book.dto";
import { books } from "../repositories/book.repository";
import { BookService } from "../services/book.service";

let bookService: BookService = new BookService();


export class BookController{
    createBook = (req: Request, res: Response) => {
        try{
            const validation = CreateBookDto.safeParse(req.body);
        if(!validation.success){
            
            return res.status(400).json({errors: validation.error});
        }
        
        const {id,title} = validation.data;
        const newBook: Book = bookService.createBook({id,title});
        return res.status(201).json(newBook);
        }catch(error){
            return res.status(409).json({message:(error as Error).message});
        } 
    }
    getBooks = (req: Request, res: Response) => {
        const return_book: Book[] = bookService.getAllBooks();
        return res.status(200).json(return_book);
    }
}