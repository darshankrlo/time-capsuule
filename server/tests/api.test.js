import request from "supertest";
import app from "../src/app.js";

describe("API", () => {
  test("GET /api/health returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("unknown route returns 404", async () => {
    const res = await request(app).get("/api/nothing");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  test("GET /api/capsules without token returns 401", async () => {
    const res = await request(app).get("/api/capsules");
    expect(res.status).toBe(401);
  });

  test("GET /api/capsules with bad token returns 401", async () => {
    const res = await request(app)
      .get("/api/capsules")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_TOKEN");
  });

  test("register with invalid body returns 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "A", email: "bad", password: "123" });
    expect(res.status).toBe(400);
  });

  test("admin route without token returns 401", async () => {
    const res = await request(app).get("/api/admin/stats");
    expect(res.status).toBe(401);
  });
});