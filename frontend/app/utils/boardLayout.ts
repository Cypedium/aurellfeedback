export type BoardHeader = { key: string; title: string };
export type SavedCardPosition = { id: string; x: number; y: number; w: number; h: number };
export type CardPosition = { i: string; x: number; y: number; w: number; h: number };

export const DEFAULT_HEADERS: BoardHeader[] = [
  { key: "todo", title: "To Do" },
  { key: "in-progress", title: "In Progress" },
  { key: "test", title: "Test" },
  { key: "done", title: "Done" },
];

export const MIN_COLS = 2;
export const MAX_COLS = 10;

export const clampCols = (n: unknown) => {
  const num = Number(n) || DEFAULT_HEADERS.length;
  return Math.min(MAX_COLS, Math.max(MIN_COLS, Math.floor(num)));
};

// Använder standardrubrikerna om användaren inte har några egna
export const withDefaultHeaders = (headers?: BoardHeader[]) =>
  headers && headers.length > 0 ? headers : DEFAULT_HEADERS;

// Varje kort är en kolumn brett och en rad högt. Sparade positioner behålls,
// nya kort hamnar sist i första kolumnen (To Do).
export const buildCardLayout = (
  cardIds: string[],
  saved: SavedCardPosition[] = [],
  cols: number,
): CardPosition[] => {
  const byId = new Map(saved.map((s) => [s.id, s]));
  let nextTodoRow =
    saved.filter((s) => s.x === 0).reduce((max, s) => Math.max(max, s.y + 1), 0);

  return cardIds.map((id) => {
    const pos = byId.get(id);
    if (pos) {
      return { i: id, x: Math.min(Math.max(0, pos.x), cols - 1), y: pos.y, w: 1, h: 1 };
    }
    return { i: id, x: 0, y: nextTodoRow++, w: 1, h: 1 };
  });
};
