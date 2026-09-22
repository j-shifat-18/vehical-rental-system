"use client";

import React from "react";
import Link from "next/link";
import { Car, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-slate-950/80 backdrop-blur-xl mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Car className="w-4 h-4 text-slate-950" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                VELOX<span className="text-emerald-400">.</span>
              </span>
            </Link>
            <p className="mt-3 text-xs text-slate-400 max-w-sm leading-relaxed">
              Premium modern vehicle rental ecosystem. Seamless reservations, verified fleet, transparent pricing, and instant bookings for cars, bikes, vans, and SUVs.
            </p>
            <div className="flex items-center gap-2 mt-4 text-[11px] text-emerald-400/80 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Fleet & Booking API Operational (v1.0.0)
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Fleet Discovery
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/vehicles?type=car" className="hover:text-emerald-400 transition-colors">
                  Executive Cars & Sedans
                </Link>
              </li>
              <li>
                <Link href="/vehicles?type=SUV" className="hover:text-emerald-400 transition-colors">
                  All-Terrain SUVs
                </Link>
              </li>
              <li>
                <Link href="/vehicles?type=bike" className="hover:text-emerald-400 transition-colors">
                  Cruisers & Sport Bikes
                </Link>
              </li>
              <li>
                <Link href="/vehicles?type=van" className="hover:text-emerald-400 transition-colors">
                  Commercial & Passenger Vans
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Account */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Access & Security
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-400 transition-colors">
                  Create Member Account
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors">
                  Administrator Console
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                JWT & Role Based
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} VELOX Vehicle Rental System. All rights reserved.</p>
          <div className="flex items-center gap-1">
            Built with modern architecture & passion for smooth travels.
          </div>
        </div>
      </div>
    </footer>
  );
}
