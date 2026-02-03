import app from "./app";
import { PORT } from "./configs";
import { connectDb } from "./database/mangodb";

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