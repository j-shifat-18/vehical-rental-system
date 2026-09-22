"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Car, Mail, Lock, User, Phone, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { UserRole } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !phone) {
      error("Missing Information", "Please fill out all required fields.");
      return;
    }

    if (password.length < 6) {
      error("Password Too Short", "Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await signup({
        name,
        email: email.toLowerCase().trim(),
        password,
        phone: phone.trim(),
        role,
      });

      if (res.success) {
        success("Welcome to VELOX!", res.message);
        router.push(role === "admin" ? "/admin" : "/dashboard");
      } else {
        error("Registration Failed", res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10"
      >
        {/* Brand header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Car className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-xl font-black text-white">VELOX.</span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Unlock seamless vehicle reservations and fleet access.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Input
            label="Full Name"
            type="text"
            placeholder="Alex Mercer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            icon={<User className="w-4 h-4" />}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="01712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            icon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock className="w-4 h-4" />}
          />

          <Select
            label="Account Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { label: "Customer (Rent Vehicles & Manage Trips)", value: "customer" },
              { label: "Admin (Manage Fleet, Users & Bookings)", value: "admin" },
            ]}
            icon={<ShieldCheck className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-3"
          >
            Complete Registration
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
          >
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
