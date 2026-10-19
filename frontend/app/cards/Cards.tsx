"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  LayoutItem,
  ResponsiveGridLayout,
  useContainerWidth,
} from "react-grid-layout";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import debounce from "lodash.debounce";
import styles from "./Cards.module.css";
import api from "../api/api"; // ⭐ axios-instansen
import { deleteCard } from "../api/endpoints";
import {
  BoardHeader,
  SavedCardPosition,
  BOARD_COLS,
  DEFAULT_HEADERS,
  buildCardLayout,
} from "../utils/boardLayout";

type Card = {
  _id?: string;
  rating: number;
  comment: string;
  productId: string;
  username: string;
  submittedAt: string;
};

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
  const [gridLayout, setGridLayout] = useState<LayoutItem[]>([]);
  const [userName, setUserName] = useState("");
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

  // Bygg gridden när både kort och layout finns
  useEffect(() => {
    if (!layoutLoaded) return;
    const ids = cards.map((fb, i) => fb._id || String(i));
    setGridLayout(buildCardLayout(ids, userLayout.cards, BOARD_COLS));
  }, [cards, layoutLoaded]);

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
      <h1 className={styles.title}>Aurell Gira Board</h1>
      <div className={styles.boardScroll}>
        <div ref={containerRef} className={styles.board}>
          <div
            className={styles.lanes}
            style={{
              padding: `0 ${GRID_MARGIN}px`,
              gap: GRID_MARGIN,
              gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)`,
            }}
          >
            {DEFAULT_HEADERS.map((h, i) => (
              <div key={h.key} className={styles.lane}>
                <span className={styles.laneTitle}>{h.title}</span>
                <span className={styles.laneCount}>
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
                setGridLayout([...currentLayout]);
                const cards = currentLayout.map((l) => ({
                  id: l.i,
                  x: l.x,
                  y: l.y,
                  w: l.w,
                  h: l.h,
                }));

                persistLayout({ ...userLayout, cards });
              }}
            >
              {cards.map((fb) => (
                <div
                  key={fb._id || fb.username + fb.submittedAt}
                  className={styles.card}
                >
                  <button
                    className={`${styles.deleteButton} no-drag`}
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
                    <FontAwesomeIcon icon={faTrash} />
                  </button>

                  <p className={styles.summary} title={fb.comment}>
                    {fb.comment}
                  </p>

                  <span className={styles.dateChip}>
                    {fb.submittedAt.substring(0, 10)}
                  </span>

                  <div className={styles.footer}>
                    <span className={styles.issueType} title="Task">
                      <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden>
                        <path
                          d="M3 8.5l3 3 7-7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className={styles.issueKey}>{fb.productId}</span>
                    <span
                      className={styles.estimate}
                      title={`Time tracking: ${fb.rating}/5`}
                    >
                      {fb.rating}
                    </span>
                    <span
                      className={styles.avatar}
                      style={{ background: avatarColor(fb.username) }}
                      title={fb.username}
                    >
                      {fb.username.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </ResponsiveGridLayout>
          ) : (
            <p className={styles.empty}>No card found.</p>
          )}
        </div>
      </div>

      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
    </div>
  );
}
