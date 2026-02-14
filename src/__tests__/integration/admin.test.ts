import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import bcrypt from "bcryptjs";

describe("ADMIN CONTROLLER - Integration Tests", () => {

  let adminToken: string;
  let createdUserId: string;

  const timestamp = Date.now();
  const adminEmail = `admintest_${timestamp}@test.com`;
  const adminUsername = `admintest_${timestamp}`;

  // ================= SETUP =================
  beforeAll(async () => {

    await UserModel.deleteMany({
      $or: [{ email: adminEmail }, { username: adminUsername }],
    });

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create Admin
    await UserModel.create({
      fullname: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    // Login Admin
    const login = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password: "password123",
      });

    if (!login.body.token) {
      throw new Error("Admin login failed");
    }

    adminToken = login.body.token;
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: /test\.com$/ });
  });

  // ================= ADMIN ACCESS =================
  describe("Admin Access", () => {

    test("16. Admin route should work", async () => {
      const res = await request(app)
        .get("/api/admin/users/test")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    test("22. Should fail without token", async () => {
      const res = await request(app).get("/api/admin/users");
      expect(res.status).toBe(401);
    });

    test("23. Should fail if not admin", async () => {

      const userEmail = `user_${Date.now()}@test.com`;
      const hashedPassword = await bcrypt.hash("password123", 10);

      await UserModel.create({
        fullname: "John",
        email: userEmail,
        password: hashedPassword,
        role: "user",
      });

      const userLogin = await request(app)
        .post("/api/auth/login")
        .send({
          email: userEmail,
          password: "password123",
        });

      const token = userLogin.body.token;

      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

  });

  // ================= USER MANAGEMENT =================
  describe("User Management (Admin)", () => {

    test("17. Admin create user", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "New",
          lastName: "User",
          email: `newuser_${Date.now()}@test.com`,
          password: "password123",
          confirmPassword: "password123",
          username: `newuser_${Date.now()}`,
        });

      expect(res.status).toBe(201);
      createdUserId = res.body.data._id;
    });

    test("18. Admin get all users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    test("19. Admin get user by id", async () => {
      const res = await request(app)
        .get(`/api/admin/users/${createdUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    test("20. Admin update user", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${createdUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ firstName: "UpdatedAdmin" });

      expect(res.status).toBe(200);
    });

    test("21. Admin delete user", async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${createdUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    test("25. Admin delete non-existing user", async () => {
      const res = await request(app)
        .delete("/api/admin/users/64b123456789123456789123")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

  });

  // ================= PAGINATION =================
  describe("Pagination", () => {

    test("24. Admin pagination test", async () => {
      const res = await request(app)
        .get("/api/admin/users?page=1&size=5")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination).toBeDefined();
    });

  });

});
