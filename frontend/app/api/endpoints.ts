// app/api/endpoints.ts
import api from "./api";

export type Card = {
  _id?: string;
  rating: number;
  comment: string;
  productId: string;
  username: string;
  submittedAt: string;
};

export type User = {
  username: string;
  password: string;
  pictureUrl?: string;
};

// Har varit /register enbart här men vid registrering är man inte inloggad
export const registerUser = (user: User) => api.post("auth/register", user);

// Logout ska gå mot din riktiga backend-route
export const logoutUser = (refreshToken: string) =>
  api.post("/logout", { refreshToken });

// Refresh-token endpoint
export const refreshToken = (refreshToken: string) =>
  api.post("/refresh", { refreshToken });

// ⭐ FEEDBACK
export const submitCard = (card: Card) =>
  api.post("/card", card);

export const getCards = () => api.get("/cards");

export const deleteCard = (id: string) =>
  api.delete(`/card/${id}`);

// ⭐ USERS
export const getUsers = () => api.get("/users");

export default {
  registerUser,
  logoutUser,
  refreshToken,
  submitCard,
  getCards,
  getUsers,
  deleteCard,
};
