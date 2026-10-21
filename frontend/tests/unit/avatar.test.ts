import { describe, expect, it } from "@jest/globals";
import { AVATAR_COLORS, avatarColor, avatarInitials } from "../../app/utils/avatar";

describe("avatarColor", () => {
  it("returns the same palette colour for the same name", () => {
    expect(avatarColor("alice")).toBe(avatarColor("alice"));
    expect(AVATAR_COLORS).toContain(avatarColor("alice"));
  });

  it("handles an empty name", () => {
    expect(avatarColor("")).toBe(AVATAR_COLORS[0]);
  });
});

describe("avatarInitials", () => {
  it("uses the first two letters in upper case", () => {
    expect(avatarInitials("mikael")).toBe("MI");
    expect(avatarInitials("a")).toBe("A");
  });
});
