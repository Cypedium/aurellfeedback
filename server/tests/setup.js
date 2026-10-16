// Deterministic test secrets; set before app.js loads dotenv (dotenv never overrides)
process.env.JWT_SECRET = "test-access-secret";
process.env.REFRESH_SECRET = "test-refresh-secret";
process.env.CLIENT_URL = "http://localhost:3000";
