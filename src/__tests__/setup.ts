import { connectDb } from "../database/mangodb";
import mongoose from "mongoose";

beforeAll(async () => {
    if (process.env.RUN_INTEGRATION === "true" && process.env.MONGODB_URL) {
        await connectDb();
    }
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
});
