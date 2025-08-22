const request = require("supertest");
const app = require("../app"); // Your main Express file
const mongoose = require("mongoose");
const User = require("../models/User");

// Before all tests, connect to the test database (or clean it)
beforeAll(async () => {
  // Use a separate test database to avoid polluting the development one
  await mongoose.connect(
    process.env.MONGO_URI_TEST || "mongodb://localhost:27017/crm_test_db",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Other options for Mongoose 6+ are no longer necessary
    }
  );
  await User.deleteMany({}); // Clean the users collection before each test run
});

// After all tests, disconnect
afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth API", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.user).toHaveProperty("email", "test@example.com");
    expect(res.body).toHaveProperty("token");
  });

  it("should login an existing user", async () => {
    // First, register a user to login
    await request(app).post("/api/auth/register").send({
      name: "Login Test",
      email: "login@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.user).toHaveProperty("email", "login@example.com");
    expect(res.body).toHaveProperty("token");
  });

  // Test protected route (e.g.: getMe)
  it("should get current user profile with valid token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Profile User",
      email: "profile@example.com",
      password: "profilePassword",
    });
    const token = registerRes.body.token;

    const res = await request(app)
      .get("/api/users/me")
      .set("Cookie", `token=${token}`); // Sends the token as a cookie

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("email", "profile@example.com");
  });

  it("should not get current user profile without token", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("success", false);
  });
});
