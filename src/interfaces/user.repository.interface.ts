import { UserType } from "../types/user.type"; 

export interface UserRepositoryInterface{
    createUser(user: UserType) : Promise<UserType>;
    getUsers(): Promise<UserType[]>;
}
