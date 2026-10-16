// Import the Express app no axios here, we want to test the actual Express routes
const request = require("supertest");
const app = require("../app/app"); // Import the Express app

describe("API tests for aurellcard", () => {
  test("GET /cards should return array", async () => {
    const res = await request(app).get("/card");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
