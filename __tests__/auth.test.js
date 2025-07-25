const request = require("supertest");
const app = require("../app"); // Seu arquivo principal do Express
const mongoose = require("mongoose");
const User = require("../models/User");

// Antes de todos os testes, conecte-se ao banco de dados de teste (ou limpe-o)
beforeAll(async () => {
  // Use um banco de dados de teste separado para evitar sujar o de desenvolvimento
  await mongoose.connect(
    process.env.MONGO_URI_TEST || "mongodb://localhost:27017/crm_test_db",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Outras opções para Mongoose 6+ não são mais necessárias
    }
  );
  await User.deleteMany({}); // Limpe a coleção de usuários antes de cada execução de teste
});

// Depois de todos os testes, desconecte-se
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
    // Primeiro, registre um usuário para fazer login
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

  // Testar rota protegida (ex: getMe)
  it("should get current user profile with valid token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Profile User",
      email: "profile@example.com",
      password: "profilePassword",
    });
    const token = registerRes.body.token;

    const res = await request(app)
      .get("/api/users/me")
      .set("Cookie", `token=${token}`); // Envia o token como cookie

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
