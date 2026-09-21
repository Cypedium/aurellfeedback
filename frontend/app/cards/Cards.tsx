'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { LayoutItem, ResponsiveGridLayout } from 'react-grid-layout';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import debounce from 'lodash.debounce';
import styles from './Cards.module.css';
import api from '../api/api'; // ⭐ axios-instansen
import { deleteCard } from '../api/endpoints';

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
    headers: { key: string; title: string }[];
    cards?: { id: string; x: number; y: number; w: number; h: number }[];
};

const DEFAULT_LAYOUT: UserLayout = { cols: 6, headers: [] };

export default function Home() {
    const [cards, setCards] = useState<Card[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [userLayout, setUserLayout] = useState<UserLayout>(DEFAULT_LAYOUT);
    const [gridLayout, setGridLayout] = useState<LayoutItem[]>([]);
    const [userName, setUserName] = useState('');

    // 🔥 Hämta card via api.ts (token-rotation ingår)
    useEffect(() => {
        const fetchCards = async () => {
            try {
                const res = await api.get('/card');
                setCards(res.data || []);
            } catch (err: any) {
                console.error('Error fetching cards:', err);
                setError('Error fetching cards: ' + err.message);
            }
        };

        setUserName(localStorage.getItem('username') || '');
        fetchCards();
    }, []);

    // 🔥 Hämta layout från server eller localStorage
    useEffect(() => { const loadLayout = async () => {
        try {
            const res = await api.get('/user/layout');
            if (res.status === 200) {
                const merged = { ...DEFAULT_LAYOUT, ...res.data };
                merged.cols = clampCols(merged.cols);
                setUserLayout(merged);
                buildGridLayout(merged, cards);
                return;
            }
        } catch (e) {
            console.warn('Could not load layout from server, falling back to localStorage');
        }

        const saved = localStorage.getItem('user_layout');
        if (saved) {
            const parsed = JSON.parse(saved);
            parsed.cols = clampCols(parsed.cols);
            const merged = { ...DEFAULT_LAYOUT, ...parsed };
            setUserLayout(merged);
            buildGridLayout(merged, cards);
        } else {
            setUserLayout(DEFAULT_LAYOUT);
            buildGridLayout(DEFAULT_LAYOUT, cards);
        }
    };

    loadLayout();
}, [cards.length]);

    const clampCols = (n: any) => {
        const num = Number(n) || DEFAULT_LAYOUT.cols;
        return Math.min(10, Math.max(2, Math.floor(num)));
    };

    const buildGridLayout = (layoutConfig: UserLayout, items: Card[]) => {
        const cols = clampCols(layoutConfig.cols);
        const colWidth = Math.max(1, Math.floor(cols / 3));
        const newLayout: LayoutItem[] = items.map((fb, i) => ({
            i: fb._id || String(i),
            x: (i * colWidth) % cols,
            y: Math.floor((i * colWidth) / cols) * 2,
            w: colWidth,
            h: 2,
            static: false
        }));
        setGridLayout(newLayout);
    };

    useEffect(() => {
        buildGridLayout(userLayout, cards);
    }, []);

    // Debug when null items exists
    //console.log(cards.map(item => item.submittedAt));

    // 🔥 Spara layout till server via api.ts
    const saveLayoutToServer = useCallback(
        debounce(async (newLayout: UserLayout) => {
            try {
                await api.put('/user/layout', newLayout);
            } catch (e) {
                console.error('Failed to save layout to server', e);
            }
        }, 800),
        []
    );

    const persistLayout = (next: UserLayout) => {
        next.cols = clampCols(next.cols);
        setUserLayout(next);
        localStorage.setItem('user_layout', JSON.stringify(next));
        saveLayoutToServer(next);
    };

    const onLayoutChange = (layout: LayoutItem[]) => {
        setGridLayout(layout);
        const cards = layout.map(l => ({ id: l.i, x: l.x, y: l.y, w: l.w, h: l.h }));
        persistLayout({ ...userLayout, cards });
    };

    const updateCols = (cols: number) => {
        const clamped = clampCols(cols);
        const next = { ...userLayout, cols: clamped };
        buildGridLayout(next, cards);
        persistLayout(next);
    };

    const deleteCardCard = async (id: string) => {
        try {
            await deleteCard(id);
            setCards(prev => prev.filter(fb => fb._id !== id));
        } catch (err: any) {
            console.error('Error deleting card:', err);
            setError(err.message || 'Error deleting card');
        }
    };

    return (
        <div id="cards-container">
            <br />
            <h1 className={styles.title}>Aurell Gira Board</h1>
            <div>
                <label>
                    <strong>Kolumner</strong>
                    <select
                        value={userLayout.cols}
                        onChange={(e) => updateCols(Number(e.target.value))}
                        style={{ marginLeft: 8 }}
                    >
                        {Array.from({ length: 9 }, (_, i) => i + 2).map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </label>

                <div>
                    <strong>Rubriker</strong>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        {(userLayout.headers || []).map((h, i) => (
                            <input
                                key={h.key}
                                value={h.title}
                                onChange={(e) => {
                                    const newHeaders = [...(userLayout.headers || [])];
                                    newHeaders[i] = { ...newHeaders[i], title: e.target.value };
                                    persistLayout({ ...userLayout, headers: newHeaders });
                                }}
                                placeholder={`Header ${i + 1}`}
                                style={{ padding: 6 }}
                            />
                        ))}
                        <button onClick={() => {
                            const newHeaders = [...(userLayout.headers || []), { key: `col${Date.now()}`, title: 'Ny kolumn' }];
                            persistLayout({ ...userLayout, headers: newHeaders });
                        }}>Lägg till</button>
                    </div>
                </div>
            </div>

            <div className={styles.wrapper}>
            {cards.length > 0 ? (
                <ResponsiveGridLayout
                    className="gridLayout"
                    layouts={{ lg: gridLayout as any }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{
                        lg: clampCols(userLayout.cols),
                        md: clampCols(userLayout.cols),
                        sm: Math.min(clampCols(userLayout.cols), 4),
                        xs: 2,
                        xxs: 1
                    }}
                    rowHeight={120}
                    width={1200}
                    onLayoutChange={(currentLayout) => {
                        const layoutArray = currentLayout as LayoutItem[];
                        setGridLayout(layoutArray);
                        // persist...
                    }}
                >
                    {cards.map((fb) => (  
                        <div key={fb._id || fb.username + fb.submittedAt} className={styles.card} style={{ padding: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="card-handle" style={{ cursor: 'grab', fontWeight: 600 }}>☰</div>
                                <button className={styles.deleteButton} onClick={() => {
                                    if (userName === fb.username) {
                                        if (confirm('Are you sure you want to delete this card?')) {
                                            if (fb._id) {
                                                deleteCardCard(fb._id);
                                            } else {
                                                alert('Card ID is missing. Cannot delete.');
                                            }
                                        }
                                    } else {
                                        alert('You can only delete your own card.');
                                    }
                                }}>
                                    <FontAwesomeIcon icon={faTrash} style={{ color: 'black' }} />
                                </button>
                            </div>

                            <p><em><strong>Date:</strong></em> {fb.submittedAt.substring(0, 10)}</p>
                            <p><em><strong>User: </strong></em> {fb.username}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <p style={{ margin: 0 }}><em><strong>Time Tracking:</strong></em></p>
                                <div className={styles.starRating}>
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < fb.rating ? '' : styles.empty}>★</span>
                                    ))}
                                </div>
                            </div>
                            <p><em><strong>Issue Key:</strong></em> {fb.productId}</p>
                            <p><em><strong>Summary:</strong></em> {fb.comment}</p>
                        </div>
                    ))}
                </ResponsiveGridLayout>
            ) : (<p>No card found.</p>)
            }
            </div>

            {error && <div style={{ color: 'red', marginTop: 12 }}></div>}
        </div >
    );
}