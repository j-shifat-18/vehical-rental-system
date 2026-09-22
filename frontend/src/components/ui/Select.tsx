"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, icon, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-slate-300 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full appearance-none bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all duration-200 cursor-pointer",
              "focus:outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-900/90",
              icon ? "pl-10 pr-10" : "pr-10",
              error ? "border-rose-500/80 focus:border-rose-500" : "",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-slate-900 text-slate-100"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 text-slate-400 pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <span className="text-xs text-rose-400 mt-0.5">{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
