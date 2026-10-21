import { beforeEach, describe, expect, it } from "@jest/globals";
import { getUsername, hasSession, saveSession } from "../../app/utils/session";

// Tests run in Node, so provide a minimal in-memory localStorage
const store = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
  },
});

describe("session", () => {
  beforeEach(() => store.clear());

  it("has no session or username when nothing is stored", () => {
    expect(hasSession()).toBe(false);
    expect(getUsername()).toBe("");
  });

  it("saveSession stores the username and both tokens", () => {
    saveSession("alice", "at", "rt");

    expect(store.get("username")).toBe("alice");
    expect(store.get("accessToken")).toBe("at");
    expect(store.get("refreshToken")).toBe("rt");
    expect(hasSession()).toBe(true);
    expect(getUsername()).toBe("alice");
  });

  it("counts a refresh token alone as a session", () => {
    store.set("refreshToken", "rt");

    expect(hasSession()).toBe(true);
  });
});
