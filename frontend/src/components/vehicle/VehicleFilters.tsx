"use client";

import React, { useId } from "react";
import { VehicleType } from "@/lib/types";
import { Search, Car, Bike, Truck, SlidersHorizontal } from "lucide-react";

export interface FilterState {
  category: "all" | VehicleType;
  search: string;
  status: "all" | "available" | "booked";
  sortBy: "default" | "price-asc" | "price-desc" | "name";
}

interface VehicleFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  totalCount: number;
}

export function VehicleFilters({
  filters,
  onChange,
  totalCount,
}: VehicleFiltersProps) {
  const searchInputId = useId();
  const sortSelectId = useId();

  const categories: { label: string; value: "all" | VehicleType; icon: React.ReactNode }[] = [
    { label: "All Vehicles", value: "all", icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { label: "Cars", value: "car", icon: <Car className="w-3.5 h-3.5" /> },
    { label: "SUVs", value: "SUV", icon: <Car className="w-3.5 h-3.5" /> },
    { label: "Bikes", value: "bike", icon: <Bike className="w-3.5 h-3.5" /> },
    { label: "Vans", value: "van", icon: <Truck className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search & Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <label htmlFor={searchInputId} className="sr-only">Search by name, model, or plate</label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id={searchInputId}
            type="text"
            placeholder="Search by name, model, or plate..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
        </div>

        {/* Right side controls: status toggle & sort */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Availability filter */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onChange({ ...filters, status: "all" })}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filters.status === "all"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => onChange({ ...filters, status: "available" })}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filters.status === "available"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Available Only
            </button>
          </div>

          {/* Sort select */}
          <label htmlFor={sortSelectId} className="sr-only">Sort vehicles</label>
          <select
            id={sortSelectId}
            value={filters.sortBy}
            onChange={(e) =>
              onChange({ ...filters, sortBy: e.target.value as FilterState["sortBy"] })
            }
            className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/80 cursor-pointer"
          >
            <option value="default">Default Sort</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Vehicle Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 flex-nowrap">
          {categories.map((cat) => {
            const isSelected = filters.category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onChange({ ...filters, category: cat.value })}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-bold"
                    : "bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-white border border-slate-800/80"
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:inline-block">
          Showing <span className="text-white font-semibold">{totalCount}</span> vehicle{totalCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
