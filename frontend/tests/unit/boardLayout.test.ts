import { describe, expect, it } from "@jest/globals";
import {
  DEFAULT_HEADERS,
  buildCardLayout,
  clampCols,
  withDefaultHeaders,
} from "../../app/utils/boardLayout";

describe("withDefaultHeaders", () => {
  it("returns To Do, In Progress, Test, Done when no headers are saved", () => {
    expect(withDefaultHeaders([]).map((h) => h.title)).toEqual([
      "To Do",
      "In Progress",
      "Test",
      "Done",
    ]);
    expect(withDefaultHeaders(undefined)).toBe(DEFAULT_HEADERS);
  });

  it("keeps the user's own headers", () => {
    const own = [{ key: "a", title: "Backlog" }];
    expect(withDefaultHeaders(own)).toBe(own);
  });
});

describe("clampCols", () => {
  it.each([
    [undefined, 4],
    [1, 2],
    [11, 10],
    [5.7, 5],
  ])("clamps %s to %s", (input, expected) => {
    expect(clampCols(input)).toBe(expected);
  });
});

describe("buildCardLayout", () => {
  it("stacks new cards in the first column, one cell each", () => {
    expect(buildCardLayout(["a", "b"], [], 4)).toEqual([
      { i: "a", x: 0, y: 0, w: 1, h: 1 },
      { i: "b", x: 0, y: 1, w: 1, h: 1 },
    ]);
  });

  it("keeps saved positions, resets size and clamps x to the column count", () => {
    const saved = [
      { id: "a", x: 2, y: 3, w: 3, h: 2 },
      { id: "b", x: 9, y: 0, w: 1, h: 1 },
    ];
    expect(buildCardLayout(["a", "b"], saved, 4)).toEqual([
      { i: "a", x: 2, y: 3, w: 1, h: 1 },
      { i: "b", x: 3, y: 0, w: 1, h: 1 },
    ]);
  });

  it("places new cards below saved cards in the first column", () => {
    const saved = [{ id: "a", x: 0, y: 2, w: 1, h: 1 }];
    expect(buildCardLayout(["a", "new"], saved, 4)[1]).toEqual({
      i: "new",
      x: 0,
      y: 3,
      w: 1,
      h: 1,
    });
  });
});
