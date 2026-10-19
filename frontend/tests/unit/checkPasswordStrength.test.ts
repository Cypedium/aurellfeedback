import { describe, expect, it } from "@jest/globals";
import checkPasswordStrength from "../../app/utils/checkPasswordStrength";

describe("checkPasswordStrength", () => {
  it.each([
    ["abc", "Weak"],
    ["abcdefgh", "Weak"],
    ["abc12345", "Medium"],
    ["abc123!@", "Strong"],
  ])("rates %s as %s", (password, expected) => {
    expect(checkPasswordStrength(password)).toBe(expected);
  });
});
