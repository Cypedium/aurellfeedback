'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hasSession } from "../utils/session";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      // ❌ Ingen token alls → användaren är inte inloggad
      if (!hasSession()) {
        router.replace("/login");
        setIsAuthenticated(false);
        return;
      }

      // ✔ Minst en token finns → låt axios-interceptorn avgöra resten
      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}