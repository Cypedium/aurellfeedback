import { describe, expect, it } from "@jest/globals";
import {
  BOARD_COLS,
  DEFAULT_HEADERS,
  buildCardLayout,
  columnForStatus,
  statusForColumn,
} from "../../app/utils/boardLayout";

describe("DEFAULT_HEADERS", () => {
  it("is To Do, In Progress, Test, Done", () => {
    expect(DEFAULT_HEADERS.map((h) => h.title)).toEqual([
      "To Do",
      "In Progress",
      "Test",
      "Done",
    ]);
    expect(BOARD_COLS).toBe(4);
  });

  it("uses the backend status keys", () => {
    expect(DEFAULT_HEADERS.map((h) => h.key)).toEqual(["todo", "in-progress", "test", "done"]);
  });
});

describe("columnForStatus / statusForColumn", () => {
  it("maps each status to its column and back", () => {
    DEFAULT_HEADERS.forEach((h, i) => {
      expect(columnForStatus(h.key)).toBe(i);
      expect(statusForColumn(i)).toBe(h.key);
    });
  });

  it("puts cards without a known status in To Do", () => {
    expect(columnForStatus(undefined)).toBe(0);
    expect(columnForStatus("archived")).toBe(0);
  });

  it("clamps out-of-range columns", () => {
    expect(statusForColumn(-1)).toBe("todo");
    expect(statusForColumn(9)).toBe("done");
  });
});

describe("buildCardLayout", () => {
  it("places cards in the column of their status, one cell each", () => {
    expect(
      buildCardLayout([
        { id: "a" },
        { id: "b", status: "test" },
        { id: "c", status: "todo" },
      ]),
    ).toEqual([
      { i: "a", x: 0, y: 0, w: 1, h: 1 },
      { i: "b", x: 2, y: 0, w: 1, h: 1 },
      { i: "c", x: 0, y: 1, w: 1, h: 1 },
    ]);
  });

  it("keeps the saved row when the saved column matches the status", () => {
    const saved = [{ id: "a", x: 3, y: 4, w: 3, h: 2 }];
    expect(buildCardLayout([{ id: "a", status: "done" }], saved)).toEqual([
      { i: "a", x: 3, y: 4, w: 1, h: 1 },
    ]);
  });

  it("follows the status when someone else moved the card", () => {
    const saved = [{ id: "a", x: 0, y: 2, w: 1, h: 1 }];
    expect(buildCardLayout([{ id: "a", status: "in-progress" }], saved)).toEqual([
      { i: "a", x: 1, y: 0, w: 1, h: 1 },
    ]);
  });

  it("places cards without a saved row below the saved ones in their column", () => {
    const saved = [{ id: "a", x: 0, y: 2, w: 1, h: 1 }];
    expect(buildCardLayout([{ id: "new" }, { id: "a" }], saved)[0]).toEqual({
      i: "new",
      x: 0,
      y: 3,
      w: 1,
      h: 1,
    });
  });
});
