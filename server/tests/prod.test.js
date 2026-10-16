require('dotenv').config();
const axios = require("axios");

const BASE_URL = "https://aurellcard-backend.fly.dev";

test("GET /cards on production", async () => {
  const res = await axios.get(`${BASE_URL}/cards`);
  console.log(BASE_URL); // Log the base URL for debugging
  console.log("Response data:", res.data); // Log response data for debugging
  expect(res.status).toBe(200);
  expect(Array.isArray(res.data)).toBe(true);
});
