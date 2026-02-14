// import request from "supertest";
// import app from "../../app";
// import { UserModel } from "../../models/user.model";

// describe(
//     'Authentication Integration Tests',
//     () => {
//         const testUser = {
//             fullName: 'Test',
//             email: 'test@gmail.com',
//             password: "password123",
//             phoneNumber: "9845123456",
//             address: "Kathmandu"

//         }
//         beforeAll(async () => {
//             await UserModel.deleteMany({email: testUser.email});
//         });
//         afterAll(async () => {
//             await UserModel.deleteMany({email: testUser.email});
//         });


//         describe(
//             'POST /api/auth/register', // nested describe block
//             () => {
//                 test( // actual test case
//                     'should register a new user', // test case description
//                     async () => { // test case implementation
//                         const response = await request(app)
//                             .post('/api/auth/register')
//                             .send(testUser)
                        
//                         expect(response.status).toBe(201);
//                         expect(response.body).toHaveProperty(
//                             'message', 
//                             'register succesfull'
//                         );
//                     }
//                 )
//             }
//         )
//     }
// );



import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Authentication Integration Tests", () => {

    const testUser = {
        fullName: "Test User",
        email: "test@gmail.com",
        password: "password123",
        phoneNumber: "9845123456",
        address: "Kathmandu"
    };

    let token: string;
    let userId: string;

    //setup
    beforeAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
    });

    //register
    describe("POST /api/auth/register", () => {

        test("1. should register a new user", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(testUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty(
                "message",
                "register succesfull"
            );

            userId = response.body.data?._id;
        });

        test("2. should not allow duplicate email", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(testUser);

            expect(response.status).toBe(409);
        });

        test("3. should fail with invalid body", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({ email: "bademail" });

            expect(response.status).toBe(400);
        });
    });

    //login
    describe("POST /api/auth/login", () => {

        test("4. should login successfully", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body.token).toBeDefined();

            token = response.body.token;
        });

        test("5. should fail with wrong password", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: "wrongpassword"
                });

            expect(response.status).toBe(401);
        });

        test("6. should fail with invalid body", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ email: "invalid" });

            expect(response.status).toBe(400);
        });
    });

    //whoami
    describe("GET /api/auth/whoami", () => {

        test("7. should fail without token", async () => {
            const response = await request(app)
                .get("/api/auth/whoami");

            expect(response.status).toBe(401);
        });

        test("8. should get current user with token", async () => {
            const response = await request(app)
                .get("/api/auth/whoami")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data.email).toBe(testUser.email);
        });
    });

    // updateprofile
    describe("PUT /api/auth/update-profile", () => {

        test("9. should fail without token", async () => {
            const response = await request(app)
                .put("/api/auth/update-profile")
                .send({ fullName: "Updated" });

            expect(response.status).toBe(401);
        });

        test("10. should update profile successfully", async () => {
            const response = await request(app)
                .put("/api/auth/update-profile")
                .set("Authorization", `Bearer ${token}`)
                .send({ fullName: "Updated Name" });

            expect(response.status).toBe(200);
        });
    });

    //password reset
    describe("Password Reset Flow", () => {

        test("11. should send reset password email", async () => {
            const response = await request(app)
                .post("/api/auth/send-reset-password-email")
                .send({ email: testUser.email });

            expect(response.status).toBe(200);
        });

        test("12. should fail reset with invalid token", async () => {
            const response = await request(app)
                .post("/api/auth/reset-password/invalidtoken")
                .send({ newPassword: "newpass123" });

            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });

});
