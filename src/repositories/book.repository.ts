import { Book } from "../types/book.type";

export const books: Book[] = [
    {id:"B-1", title:'1984'},
    {id:"B-2", title:'The Great Gatsby', date:"2024-01-01"}
];

export interface IBookRepository{
    getAllBooks():Book[];
    createBook(book: Book): Book;
    getBookById(id: string): Book | undefined;
}

export class BookRepository implements IBookRepository{
    getBookById(id: string): Book | undefined {
        return books.find((book) => book.id === id);
    }
    createBook(book: Book): Book {
        books.push(book);
        return book;
    }
    getAllBooks(): Book[] {
        return books;
    }
}