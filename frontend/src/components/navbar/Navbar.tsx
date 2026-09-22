"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import {
  Car,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, role, logout } = useAuth();
  const { success } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    success("Logged out", "You have been safely signed out.");
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { label: "Fleet", href: "/vehicles" },
    { label: "Why Velox", href: "/#why-us" },
    ...(role === "customer"
      ? [{ label: "My Bookings", href: "/dashboard" }]
      : []),
    ...(role === "admin"
      ? [{ label: "Admin Console", href: "/admin" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <Car className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              VELOX<span className="text-emerald-400">.</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-slate-400 -mt-1 font-semibold">
              Vehicle Rental
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-white/5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Status / Auth CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 px-3.5 py-1.5 rounded-xl transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {user.name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-52 rounded-2xl bg-slate-900/95 border border-slate-800 p-2 shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {user.role} Account
                      </span>
                    </div>

                    {user.role === "admin" ? (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                        My Bookings
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center md:hidden gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-5 py-4 flex flex-col gap-3"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-emerald-400 py-1.5"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-2 py-1">
                    <UserIcon className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-white font-semibold">{user.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase">({user.role})</span>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1"
                  >
                    <Button variant="secondary" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1"
                  >
                    <Button variant="primary" size="sm" className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
