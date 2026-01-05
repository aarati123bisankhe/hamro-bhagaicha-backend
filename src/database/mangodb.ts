import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const mongoUri = process.env.MONGODB_URL; 

    if (!mongoUri) {
      throw new Error("MONGODB_URL is missing");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");
  } catch (e) {
    console.error("MongoDB error:", e);
    process.exit(1);
  }
};
