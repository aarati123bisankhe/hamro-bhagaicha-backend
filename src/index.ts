import express, { Application,Request, Response } from 'express';
import bodyParser from 'body-parser';
import bookRoutes from './routes/book.route';
import {PORT} from './configs';
import {connectDb} from './database/mangodb';

import dotenv from 'dotenv';
dotenv.config();
//can use .env variable after this
console.log(process.env.PORT);
// ENV -> PORT=5055
import authRoutes from './routes/auth.route';
import bookRoute from './routes/book.route';
import adminUserRoutes from './routes/admin/user.route';


const app:Application = express();
const port = 3000;


app.use(bodyParser.json());

app.use("/api/auth", authRoutes)

app.use("/api/book", bookRoute)

app.use('/api/books',bookRoutes);

app.use('/api/admin/users', adminUserRoutes)

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

async function startServer(){
    await connectDb();


app.listen(
    PORT,
     () => {
    console.log(`server : http://localhost:${PORT}`);
}
);
}

startServer();