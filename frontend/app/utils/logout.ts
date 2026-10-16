import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// utils/logout.ts or inside your component
export const handleLogout = async () => {
  try {
    // Inform backend that user logs out (optional but recommended)
    await fetch('/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: localStorage.getItem('refreshToken')
      })
    });

    // Remove BOTH tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Redirect to login
    window.location.href = '/login';

  } catch (err) {
    console.error('Logout failed:', err);
  }
};
