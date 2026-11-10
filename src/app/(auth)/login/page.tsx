"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@tournament.app");
  const [password, setPassword] = useState("demo123");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Instant redirect to dashboard for seamless local experience
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl border border-border/60 bg-card shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black mx-auto shadow-lg shadow-primary/25">
          <Trophy className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Welcome to TourneyPro
        </h1>
        <p className="text-xs text-muted-foreground">
          Sign in to manage brackets, stages, auto-schedules & banners.
        </p>
      </div>

      <div className="p-3 rounded-xl border border-primary/30 bg-primary/10 text-xs text-primary flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>Pre-filled with tournament administrator demo credentials.</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-secondary text-foreground border border-border"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-secondary text-foreground border border-border"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign In to Studio"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
