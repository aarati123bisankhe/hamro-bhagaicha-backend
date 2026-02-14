import { connectDb } from "../database/mangodb";
import mongoose from "mongoose";

// before all test starts
beforeAll(async () => {
    await connectDb();
});

// after all tests are done
afterAll(async () => {
    await mongoose.connection.close();
});