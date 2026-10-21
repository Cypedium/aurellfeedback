import { describe, expect, it } from "@jest/globals";
import { MAX_PICTURE_BYTES, validateRegistration } from "../../app/utils/register";

describe("validateRegistration", () => {
  it("accepts a valid form with or without a picture", () => {
    expect(validateRegistration("alice", "secret1")).toBeNull();
    expect(validateRegistration("alice", "secret1", { size: MAX_PICTURE_BYTES })).toBeNull();
  });

  it.each([
    ["", "secret1"],
    ["alice", ""],
  ])("requires both fields (%j, %j)", (username, password) => {
    expect(validateRegistration(username, password)).toBe("Both fields are required.");
  });

  it("requires at least 6 password characters", () => {
    expect(validateRegistration("alice", "12345")).toBe("Password must be at least 6 characters.");
  });

  it("rejects pictures over the size limit", () => {
    expect(validateRegistration("alice", "secret1", { size: MAX_PICTURE_BYTES + 1 })).toMatch(/smaller than 1 MB/);
  });
});
