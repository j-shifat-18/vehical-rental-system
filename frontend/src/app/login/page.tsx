"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Car, Mail, Lock, Sparkles, Shield, User } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login, quickDemoLogin } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState<"admin" | "customer" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Missing Fields", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        success("Welcome Back!", "You have successfully signed in.");
        router.push("/dashboard");
      } else {
        error("Sign In Failed", res.message || "Invalid credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: "admin" | "customer") => {
    setIsDemoLoading(role);
    try {
      const ok = await quickDemoLogin(role);
      if (ok) {
        success(
          "Demo Session Ready",
          `Logged in as ${role === "admin" ? "Fleet Administrator" : "Customer"}.`
        );
        router.push(role === "admin" ? "/admin" : "/dashboard");
      } else {
        error("Demo Sign In Failed", "Could not initialize demo account.");
      }
    } finally {
      setIsDemoLoading(null);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Car className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-xl font-black text-white">VELOX.</span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your bookings, profile, or fleet operations console.
          </p>
        </div>

        {/* 1-Click Reviewer Demo Login Buttons */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Instant Demo Account Sign-In
          </span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              isLoading={isDemoLoading === "customer"}
              onClick={() => handleDemoLogin("customer")}
              className="text-xs py-2"
              icon={<User className="w-3.5 h-3.5 text-cyan-400" />}
            >
              Demo Customer
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              isLoading={isDemoLoading === "admin"}
              onClick={() => handleDemoLogin("admin")}
              className="text-xs py-2"
              icon={<Shield className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Demo Admin
            </Button>
          </div>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] text-slate-400 uppercase font-semibold absolute">
            Or Sign In With Email
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Sign In to Account
          </Button>
        </form>

        {/* Bottom footer link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
          >
            Create free account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
