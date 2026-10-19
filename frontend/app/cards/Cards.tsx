"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Layout,
  ResponsiveGridLayout,
  useContainerWidth,
} from "react-grid-layout";
import { CheckIcon, PencilIcon, TrashIcon } from "@heroicons/react/16/solid";
import debounce from "lodash.debounce";
import api from "../api/api"; // ⭐ axios-instansen
import { deleteCard, updateCardStatus, type Card } from "../api/endpoints";
import CardForm from "./card/Card";
import {
  BoardHeader,
  CardStatus,
  SavedCardPosition,
  BOARD_COLS,
  DEFAULT_HEADERS,
  buildCardLayout,
  statusForColumn,
} from "../utils/boardLayout";

type UserLayout = {
  cols: number;
  headers: BoardHeader[];
  cards?: SavedCardPosition[];
};

const DEFAULT_LAYOUT: UserLayout = {
  cols: BOARD_COLS,
  headers: DEFAULT_HEADERS,
};

// Måste matcha ResponsiveGridLayout nedan så att rubrikerna linjerar med kolumnerna
const GRID_MARGIN = 10;
const HEADER_HEIGHT = 44;
const ROW_HEIGHT = 150;

// Jira-liknande avatarfärger, väljs stabilt per användarnamn
const AVATAR_COLORS = ["#0052cc", "#00875a", "#ff5630", "#6554c0", "#ff991f", "#00a3bf"];

// Datum, edit- och delete-knappen syns bara när man hovrar över kortet
const CARD_HOVER_CLASS =
  "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100";
const CARD_ACTION_CLASS = `no-drag rounded-[3px] px-1.5 py-1 text-jira-secondary hover:bg-jira-neutral ${CARD_HOVER_CLASS}`;

const cardKey = (fb: Card, i: number) => fb._id || String(i);

const toSavedPositions = (layout: Layout): SavedCardPosition[] =>
  layout.map((l) => ({ id: l.i, x: l.x, y: l.y, w: l.w, h: l.h }));

const avatarColor = (name: string) => {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userLayout, setUserLayout] = useState<UserLayout>(DEFAULT_LAYOUT);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  const [userName, setUserName] = useState("");
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  // Gridden följer boardens bredd så att den fyller skärmen
  const { width, containerRef, mounted } = useContainerWidth();

  // 🔥 Hämta card via api.ts (token-rotation ingår)
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await api.get("/card");
        setCards(res.data || []);
      } catch (err: any) {
        console.error("Error fetching cards:", err);
        setError("Error fetching cards: " + err.message);
      }
    };

    setUserName(localStorage.getItem("username") || "");
    fetchCards();
  }, []);

  // 🔥 Hämta layout från server eller localStorage
  useEffect(() => {
    // Boarden har alltid de fyra fasta kolumnerna, bara kortpositioner sparas
    const normalize = (raw: Partial<UserLayout>): UserLayout => ({
      ...DEFAULT_LAYOUT,
      cards: raw.cards,
    });

    const loadLayout = async () => {
      try {
        const res = await api.get("/user/layout");
        if (res.status === 200) {
          setUserLayout(normalize(res.data || {}));
          return;
        }
      } catch (e) {
        console.warn(
          "Could not load layout from server, falling back to localStorage",
        );
      }

      try {
        const saved = localStorage.getItem("user_layout");
        setUserLayout(saved ? normalize(JSON.parse(saved)) : DEFAULT_LAYOUT);
      } catch {
        setUserLayout(DEFAULT_LAYOUT);
      }
    };

    loadLayout().finally(() => setLayoutLoaded(true));
  }, []);

  // Räknas fram vid varje render, så gridden får aldrig en tom layout som
  // sedan sparas över den riktiga
  const gridLayout = useMemo(
    () =>
      layoutLoaded
        ? buildCardLayout(
            cards.map((fb, i) => ({ id: cardKey(fb, i), status: fb.status })),
            userLayout.cards,
          )
        : [],
    [cards, userLayout.cards, layoutLoaded],
  );

  // 🔥 Spara layout till server via api.ts
  const saveLayoutToServer = useCallback(
    debounce(async (newLayout: UserLayout) => {
      try {
        await api.put("/user/layout", newLayout);
      } catch (e) {
        console.error("Failed to save layout to server", e);
      }
    }, 800),
    [],
  );

  const persistLayout = (next: UserLayout) => {
    setUserLayout(next);
    localStorage.setItem("user_layout", JSON.stringify(next));
    saveLayoutToServer(next);
  };

  // Flytta kortet direkt och spara statusen; vid fel flyttas det tillbaka
  const moveCard = async (id: string, status: CardStatus) => {
    const previous = cards.find((fb) => fb._id === id)?.status;
    const setStatus = (s?: CardStatus) =>
      setCards((prev) => prev.map((fb) => (fb._id === id ? { ...fb, status: s } : fb)));

    setStatus(status);
    try {
      await updateCardStatus(id, status);
    } catch (err: any) {
      console.error("Error moving card:", err.message);
      setStatus(previous);
      setError(err.response?.data?.message || "Could not move card");
    }
  };

  // Stäng redigeringsdialogen med Escape
  useEffect(() => {
    if (!editingCard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditingCard(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingCard]);

  const handleCardSaved = (updated: Card) => {
    setCards((prev) => prev.map((fb) => (fb._id === updated._id ? updated : fb)));
    setEditingCard(null);
  };

  const deleteCardCard = async (id: string) => {
    try {
      await deleteCard(id);
      setCards((prev) => prev.filter((fb) => fb._id !== id));
    } catch (err: any) {
      console.error("Error deleting card:", err);
      setError(err.response?.data?.message || err.message || "Error deleting card");
    }
  };

  return (
    <div id="cards-container">
      <br />
      <h1 className="mb-5 text-center text-[40px] font-bold">Jira Board</h1>
      <div className="overflow-x-auto">
        <div
          ref={containerRef}
          className="relative my-4 min-h-[480px] w-full min-w-[720px]"
        >
          <div
            className="pointer-events-none absolute inset-0 grid"
            style={{
              padding: `0 ${GRID_MARGIN}px`,
              gap: GRID_MARGIN,
              gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)`,
            }}
          >
            {DEFAULT_HEADERS.map((h, i) => (
              <div
                key={h.key}
                className="flex items-start gap-2 rounded-md bg-jira-lane p-3"
              >
                <span className="truncate text-xs font-semibold uppercase text-jira-secondary">
                  {h.title}
                </span>
                <span className="text-xs text-jira-subtle">
                  {gridLayout.filter((l) => l.x === i).length}
                </span>
              </div>
            ))}
          </div>

          {!layoutLoaded || !mounted ? null : cards.length > 0 ? (
            <ResponsiveGridLayout
              className="gridLayout"
              layouts={{ lg: gridLayout }}
              breakpoints={{ lg: 0 }}
              cols={{ lg: BOARD_COLS }}
              rowHeight={ROW_HEIGHT}
              width={width}
              margin={[GRID_MARGIN, GRID_MARGIN]}
              containerPadding={[GRID_MARGIN, HEADER_HEIGHT]}
              dragConfig={{ cancel: ".no-drag" }}
              onLayoutChange={(currentLayout) => {
                persistLayout({ ...userLayout, cards: toSavedPositions(currentLayout) });
              }}
              onDragStop={(currentLayout, oldItem, newItem) => {
                if (!oldItem || !newItem || oldItem.x === newItem.x) return;
                // Spara radordningen direkt så att kortet inte hoppar när statusen ändras
                persistLayout({ ...userLayout, cards: toSavedPositions(currentLayout) });
                const card = cards.find((fb, i) => cardKey(fb, i) === newItem.i);
                if (card?._id) moveCard(card._id, statusForColumn(newItem.x));
              }}
            >
              {cards.map((fb) => (
                <div
                  key={fb._id || fb.username + fb.submittedAt}
                  // Luft mellan kortet och kolumnens kanter
                  className="px-2"
                >
                  <div
                    className="group relative flex h-full cursor-grab flex-col gap-2 overflow-hidden rounded-md bg-white p-3 font-jira text-sm text-jira-text shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)] hover:bg-jira-hover"
                  >
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-1">
                        {userName === fb.username && fb._id && (
                          <button
                            className={CARD_ACTION_CLASS}
                            aria-label="Edit card"
                            title="Edit"
                            onClick={() => setEditingCard(fb)}
                          >
                            <PencilIcon className="size-4" aria-hidden />
                          </button>
                        )}

                        <button
                          className={CARD_ACTION_CLASS}
                          aria-label="Delete card"
                          title="Delete"
                          onClick={() => {
                            if (userName === fb.username) {
                              if (
                                confirm("Are you sure you want to delete this card?")
                              ) {
                                if (fb._id) {
                                  deleteCardCard(fb._id);
                                } else {
                                  alert("Card ID is missing. Cannot delete.");
                                }
                              }
                            } else {
                              alert("You can only delete your own card.");
                            }
                          }}
                        >
                          <TrashIcon className="size-4" aria-hidden />
                        </button>
                      </div>

                      <span
                        className={`rounded-[3px] bg-jira-hover px-1.5 text-xs/5 font-bold text-jira-secondary ${CARD_HOVER_CLASS}`}
                      >
                        {/* yy-mm-dd, t.ex. 26-10-19 */}
                        {fb.submittedAt.substring(2, 10)}
                      </span>
                    </div>

                    <p
                      className="line-clamp-3 pr-12 leading-5 wrap-anywhere"
                      title={fb.comment}
                    >
                      {fb.comment}
                    </p>

                    <div className="mt-auto flex items-center gap-1.5">
                      <span
                        className="inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] bg-jira-task text-white"
                        title="Task"
                      >
                        <CheckIcon className="size-3" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold uppercase text-jira-secondary">
                        {fb.productId}
                      </span>
                      <span
                        className="min-w-5 shrink-0 rounded-full bg-jira-neutral px-1.5 text-center text-xs/4"
                        title={`Time tracking: ${fb.rating}/5`}
                      >
                        {fb.rating}
                      </span>
                      <span
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{ background: avatarColor(fb.username) }}
                        title={fb.username}
                      >
                        {fb.username.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </ResponsiveGridLayout>
          ) : (
            <p className="relative pt-14 text-center">No card found.</p>
          )}
        </div>
      </div>

      {error && <div className="mt-3 text-[red]">{error}</div>}

      {editingCard && (
        <div
          className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-[rgba(9,30,66,0.54)] px-4 py-12"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditingCard(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="card-form-title"
            className="w-full max-w-[640px]"
          >
            <CardForm
              card={editingCard}
              onSaved={handleCardSaved}
              onCancel={() => setEditingCard(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
