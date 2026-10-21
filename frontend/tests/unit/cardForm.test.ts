import { describe, expect, it } from "@jest/globals";
import { PRIORITIES, validateCardForm } from "../../app/utils/cardForm";

const valid = { comment: "Fix the login page", productId: "AGB-12", rating: 3 };

describe("validateCardForm", () => {
  it("accepts a valid form", () => {
    expect(validateCardForm(valid)).toBeNull();
  });

  it("requires a priority", () => {
    expect(validateCardForm({ ...valid, rating: 0 })).toBe("Please select a priority.");
  });

  it.each([
    ["summary", { ...valid, comment: "this is shit" }],
    ["issue key", { ...valid, productId: "fuck" }],
  ])("rejects profanity in the %s", (_field, form) => {
    expect(validateCardForm(form)).toMatch(/inappropriate language/);
  });
});

describe("PRIORITIES", () => {
  it("is 1 to 5", () => {
    expect(PRIORITIES).toEqual([1, 2, 3, 4, 5]);
  });
});
