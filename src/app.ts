import express, { Application,Request, Response } from 'express';
import bodyParser from 'body-parser';
import {PORT} from './configs';
import {connectDb} from './database/mangodb';
import cors from 'cors';

import dotenv from 'dotenv';

import authRoutes from './routes/auth.route';
import adminUserRoutes from './routes/admin/user.route';
import path from 'path';
import { HttpError } from './errors/http-error';

dotenv.config();
console.log(process.env.PORT);

const app:Application = express();

let corsOptions = {
    origin: ["http://localhost:3000"]
}

app.use("/uploads",express.static(path.join(__dirname,'../uploads')));

app.use(cors(corsOptions))



const port = 3000;


app.use(bodyParser.json());

app.use("/api/auth", authRoutes)


app.use('/api/admin/users', adminUserRoutes)

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});


app.use((err: Error, req: Request, res: Response, next: Function) => {
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});


export default app;