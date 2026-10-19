// app/api/endpoints.ts
// Paths must match the backend mounts in server/app.js: /auth, /card, /user
import api from "./api";

export type Card = {
  _id?: string;
  rating: number;
  comment: string;
  productId: string;
  username: string;
  submittedAt: string;
};

// The backend sets the author from the access token
export type NewCard = Omit<Card, "_id" | "username">;

export type User = {
  username: string;
  password: string;
  pictureUrl?: string;
};

export type PublicUser = {
  username: string;
  pictureUrl?: string;
};

// ⭐ AUTH
export const registerUser = (user: User) => api.post("/auth/register", user);

export const logoutUser = (refreshToken: string) =>
  api.post("/auth/logout", { refreshToken });

export const refreshToken = (refreshToken: string) =>
  api.post("/auth/refresh", { refreshToken });

// ⭐ CARDS
export const submitCard = (card: NewCard) =>
  api.post("/card", card);

export const getCards = () => api.get<Card[]>("/card");

export const deleteCard = (id: string) =>
  api.delete(`/card/${id}`);

// ⭐ USERS
export const getUsers = () => api.get<PublicUser[]>("/user");

export default {
  registerUser,
  logoutUser,
  refreshToken,
  submitCard,
  getCards,
  getUsers,
  deleteCard,
};
