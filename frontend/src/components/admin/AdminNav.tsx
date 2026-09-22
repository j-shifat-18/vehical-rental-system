"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, Calendar, Users, ShieldAlert } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  const tabs = [
    { label: "Overview", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Fleet Inventory", href: "/admin/vehicles", icon: <Car className="w-4 h-4" /> },
    { label: "All Bookings", href: "/admin/bookings", icon: <Calendar className="w-4 h-4" /> },
    { label: "Users & Accounts", href: "/admin/users", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              isActive
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
