// Inloggningen sparas i localStorage; se även clearSession i logout.ts

// Minst en token finns → axios-interceptorn avgör resten
export const hasSession = (): boolean =>
  Boolean(localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"));

export const getUsername = (): string => localStorage.getItem("username") || "";

export const saveSession = (username: string, accessToken: string, refreshToken: string) => {
  localStorage.setItem("username", username);
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};
