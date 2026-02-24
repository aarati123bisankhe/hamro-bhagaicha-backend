import request from "supertest";
import app from "../../app";
import { NurseryModel } from "../../models/nursery.model";

describe("Nursery Integration Tests", () => {
  const testNurseries = [
    {
      name: "Test Nursery A",
      address: "Bansbari",
      city: "Kathmandu",
      tags: ["indoor"],
      location: { type: "Point", coordinates: [85.344, 27.742] },
    },
    {
      name: "Test Nursery B",
      address: "Lalitpur",
      city: "Lalitpur",
      tags: ["outdoor"],
      location: { type: "Point", coordinates: [85.315, 27.676] },
    },
  ];

  beforeAll(async () => {
    await NurseryModel.syncIndexes();
    await NurseryModel.deleteMany({ name: /^Test Nursery/ });
    await NurseryModel.insertMany(testNurseries);
  });

  afterAll(async () => {
    await NurseryModel.deleteMany({ name: /^Test Nursery/ });
  });

  test("1. should fetch nurseries with default pagination", async () => {
    const response = await request(app).get("/api/nurseries");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.fallback).toBeDefined();
  });

  test("2. should fetch nurseries using GPS params", async () => {
    const response = await request(app).get(
      "/api/nurseries?lat=27.7172&lng=85.324&radiusKm=15"
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);

    if (response.body.data.length > 0) {
      expect(response.body.data[0].location).toHaveProperty("lat");
      expect(response.body.data[0].location).toHaveProperty("lng");
    }
  });

  test("3. should validate lat/lng pairs", async () => {
    const response = await request(app).get("/api/nurseries?lat=27.71");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
