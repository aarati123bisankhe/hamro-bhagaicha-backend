import mongoose,{Document, Schema} from "mongoose";
import { UserType } from "../types/user.type";
import { required } from "zod/v4/core/util.cjs";

const userMongoSchema: Schema = new Schema(
    {
        firtName: {type:String, required:false},
        email: {type: String, required: true, unique: true},
        username: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        address: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        role: {type: String, enum: ["user","admin"], default:"user"},
        
    },
    {
        timestamps: true,
    }
)
export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export const UserModel = mongoose.model<IUser>("User",userMongoSchema);

