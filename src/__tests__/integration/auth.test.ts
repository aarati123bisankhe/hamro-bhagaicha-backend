import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe(
    'Authentication Integration Tests',
    () => {
        const testUser = {
            fullName: 'Test',
            email: 'test@gmail.com',
            password: "password123",
            phoneNumber: "9845123456",
            address: "Kathmandu"

        }
        beforeAll(async () => {
            await UserModel.deleteMany({email: testUser.email});
        });
        afterAll(async () => {
            await UserModel.deleteMany({email: testUser.email});
        });


        describe(
            'POST /api/auth/register', // nested describe block
            () => {
                test( // actual test case
                    'should register a new user', // test case description
                    async () => { // test case implementation
                        const response = await request(app)
                            .post('/api/auth/register')
                            .send(testUser)
                        
                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty(
                            'message', 
                            'register succesfull'
                        );
                    }
                )
            }
        )
    }
);