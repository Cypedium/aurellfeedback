'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "./Card";

export default function CardPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/"); // root tar hand om redirect till login
    } else {
      setAllowed(true); // visa formuläret
    }
  }, []);

  if (!allowed) return null; // visa inget innan redirect/allow

  return <Card />;
}