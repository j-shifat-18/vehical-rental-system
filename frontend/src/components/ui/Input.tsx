"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, type, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-300 tracking-wide flex items-center justify-between"
          >
            <span>{label}</span>
            {hint && <span className="text-[11px] text-slate-400 font-normal">{hint}</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all duration-200",
              "focus:outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-900/90",
              icon ? "pl-10" : "",
              error
                ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20 text-rose-100"
                : "",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-rose-400 mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
