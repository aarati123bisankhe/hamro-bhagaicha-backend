import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const userMongoSchema: Schema = new Schema(
  {
    fullname: { type: String, required: false },
    email: {type: String, required: true, unique: true},
    password: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    profileUrl: {type: String, required: false}, 
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetPasswordCodeHash: { type: String, required: false, default: null },
    resetPasswordCodeExpiresAt: { type: Date, required: false, default: null },
    resetPasswordCodeAttempts: { type: Number, required: false, default: 0 },
  },
  { timestamps: true }
);

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>("User", userMongoSchema);
