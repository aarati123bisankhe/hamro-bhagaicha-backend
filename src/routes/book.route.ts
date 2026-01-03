import { Request, Response, Router } from 'express';
import { BookController } from '../controllers/book.controller';

const router: Router = Router();
const bookController = new BookController();

router.get('/', bookController.getBooks);

//Task
//make a router that handles GET request to /books/:id
// /:bookid and calls bookController.getBookById
//router.get('/:bookid', bookController.getBookById);

router.post('/', bookController.createBook);
    


export default router;