"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LAST_DOSSIER_ID_STORAGE_KEY } from "@/services/api";

export default function PlayersIndexPage() {
  const router = useRouter();

  useEffect(() => {
    let targetId = "13";
    try {
      const saved = localStorage.getItem(LAST_DOSSIER_ID_STORAGE_KEY);
      if (saved && !Number.isNaN(Number(saved))) {
        targetId = saved;
      }
    } catch {
      // ignore
    }
    router.replace(`/players/${targetId}`);
  }, [router]);

  return null;
}
