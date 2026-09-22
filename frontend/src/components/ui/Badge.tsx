"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "emerald"
    | "cyan"
    | "amber"
    | "rose"
    | "slate"
    | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "slate",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    emerald:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10",
    cyan:
      "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm shadow-cyan-500/10",
    amber:
      "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm shadow-amber-500/10",
    rose:
      "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-500/10",
    slate:
      "bg-slate-800 text-slate-300 border border-slate-700/60",
    outline:
      "bg-transparent text-slate-300 border border-slate-600/60",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 rounded-md font-medium tracking-wide",
    md: "text-xs px-2.5 py-1 rounded-lg font-medium tracking-wide",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 uppercase transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function VehicleStatusBadge({
  status,
}: {
  status: "available" | "booked";
}) {
  if (status === "available") {
    return (
      <Badge variant="emerald">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Available
      </Badge>
    );
  }
  return (
    <Badge variant="amber">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Booked
    </Badge>
  );
}

export function BookingStatusBadge({
  status,
}: {
  status: "active" | "cancelled" | "returned";
}) {
  if (status === "active") {
    return (
      <Badge variant="cyan">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        Active
      </Badge>
    );
  }
  if (status === "returned") {
    return (
      <Badge variant="emerald">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Returned
      </Badge>
    );
  }
  return (
    <Badge variant="rose">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
      Cancelled
    </Badge>
  );
}
