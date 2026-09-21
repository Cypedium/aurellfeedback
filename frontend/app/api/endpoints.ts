// app/api/endpoints.ts
import api from "./api";

export type Feedback = {
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
export const submitFeedback = (feedback: Feedback) =>
  api.post("/feedback", feedback);

export const getFeedbacks = () => api.get("/feedbacks");

export const deleteFeedback = (id: string) =>
  api.delete(`/feedback/${id}`);

// ⭐ USERS
export const getUsers = () => api.get("/users");

export default {
  registerUser,
  logoutUser,
  refreshToken,
  submitFeedback,
  getFeedbacks,
  getUsers,
  deleteFeedback,
};
