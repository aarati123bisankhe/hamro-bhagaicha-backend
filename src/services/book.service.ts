import { IBookRepository,BookRepository } from "../repositories/book.repository";
import {Book} from "../types/book.type";
import { CreateBookDto } from "../dtos/book.dto";
import { th } from "zod/v4/locales";
let bookRepository: IBookRepository = new BookRepository();
export class BookService{
    getAllBooks():Book[]{{
        let response: Book[] =
        bookRepository
            .getAllBooks()
            .map((book: Book) => {
                return{
                    ...book,
                    title: book.title.toUpperCase()
                };
            });
        return response;        
            
    }
}
    
    createBook(bookDto: CreateBookDto): Book{
        const newBook: Book = {
            id: bookDto.id,
            title: bookDto.title,
           
        };
        let existingBook = bookRepository.getBookById?.(newBook.id);
        if(existingBook){
            throw new Error("Book with same id already exists");    

        }
        return bookRepository.createBook(newBook);
    }
}
