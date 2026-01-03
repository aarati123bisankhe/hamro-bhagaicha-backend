// import mongoose from "mongoose";

// export const connectDb = async () => {
//   try {
//     const mongoUri = process.env.MONGO_URI;

//     if (!mongoUri) {
//       throw new Error("MONGO_URI is missing");
//     }

//     await mongoose.connect(mongoUri);
//     console.log("✅ Connected to MongoDB");
//   } catch (e) {
//     console.error("MongoDB error:", e);
//     process.exit(1);
//   }
// };

import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const mongoUri = process.env.MONGODB_URL; // <-- change here

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
