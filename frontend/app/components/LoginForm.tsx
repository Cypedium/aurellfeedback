'use client';
import { useState } from "react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Spara användarnamn (om du använder det i UI)
      localStorage.setItem("username", username);

      // ⭐ Spara tokens korrekt
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      alert("Login successful!");
      window.location.href = "/card"; // 🔥 redirect efter OK

      // Redirect om du vill
      // window.location.href = "/dashboard";

    } catch (error: any) {
      alert(error.message || "An unexpected error occurred");
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      <input
        type="text"
        placeholder="Username"
        className="w-full p-2 mb-3 border rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 mb-4 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition-colors"
      >
        Login
      </button>
    </form>
  );
}