import express, { Application,Request, Response } from 'express';
import bodyParser from 'body-parser';
import {PORT} from './configs';
import {connectDb} from './database/mangodb';
import cors from 'cors';

import dotenv from 'dotenv';

import authRoutes from './routes/auth.route';
import adminUserRoutes from './routes/admin/user.route';
import path from 'path';

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