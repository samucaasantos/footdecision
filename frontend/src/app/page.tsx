"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TOKEN_STORAGE_KEY } from "@/services/api";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070D14] flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-400 font-mono">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
        <span>Inicializando FootDecision SAD...</span>
      </div>
    </div>
  );
}
