/**
 * FRONTEND TEST
 * Testar att endpoints-funktionerna anropar rätt URL
 * utan att göra riktiga nätverksanrop.
 */

jest.mock("../api/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn()
}));

const api = require("../api/api");
const endpoints = require("../api/endpoints");

describe("Frontend API layer", () => {
  test("getCards calls /cards", async () => {
    api.get.mockResolvedValue({
      status: 200,
      data: []
    });

    const res = await endpoints.getCards();

    expect(api.get).toHaveBeenCalledWith("/card");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});
