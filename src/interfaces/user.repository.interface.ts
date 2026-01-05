import { UserDocument, User } from "../types/user.type"; 

export interface UserRepositoryInterface{
    createUser(user:User) : Promise<UserDocument>;
    getUsers(): Promise<UserDocument[]>;
}