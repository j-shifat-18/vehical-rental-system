"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Vehicle } from "@/lib/types";
import { api } from "@/lib/api";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import {
  VehicleFilters,
  FilterState,
} from "@/components/vehicle/VehicleFilters";
import { Button } from "@/components/ui/Button";
import { Car, RefreshCw, AlertCircle } from "lucide-react";

function VehiclesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("type") || "all";

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    category: (initialCategory as any) || "all",
    search: "",
    status: "all",
    sortBy: "default",
  });

  const loadVehicles = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await api.vehicles.getAll();
      if (res.success && res.data) {
        setVehicles(res.data);
      } else {
        setFetchError(res.message || "Unable to fetch fleet list.");
      }
    } catch (err: any) {
      setFetchError(err?.message || "Failed to load vehicles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        // Category filter
        if (filters.category !== "all" && v.type !== filters.category) {
          return false;
        }
        // Availability status filter
        if (filters.status !== "all" && v.availability_status !== filters.status) {
          return false;
        }
        // Search query filter (matches name or registration number)
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const matchName = v.vehicle_name.toLowerCase().includes(q);
          const matchReg = v.registration_number.toLowerCase().includes(q);
          if (!matchName && !matchReg) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA =
          typeof a.daily_rent_price === "string"
            ? parseFloat(a.daily_rent_price)
            : a.daily_rent_price;
        const priceB =
          typeof b.daily_rent_price === "string"
            ? parseFloat(b.daily_rent_price)
            : b.daily_rent_price;

        if (filters.sortBy === "price-asc") return priceA - priceB;
        if (filters.sortBy === "price-desc") return priceB - priceA;
        if (filters.sortBy === "name") return a.vehicle_name.localeCompare(b.vehicle_name);
        return 0;
      });
  }, [vehicles, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Fleet Inventory
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Explore All Vehicles
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse verified cars, SUVs, bikes, and vans ready for immediate booking.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadVehicles}
          isLoading={isLoading}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Fleet
        </Button>
      </div>

      {/* Filter Control Bar */}
      <VehicleFilters
        filters={filters}
        onChange={setFilters}
        totalCount={filteredVehicles.length}
      />

      {/* Error state */}
      {fetchError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{fetchError}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadVehicles}>
            Retry
          </Button>
        </div>
      )}

      {/* Vehicles Grid / Skeleton / Empty state */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse flex flex-col"
            >
              <div className="h-44 bg-slate-800/40 rounded-t-2xl" />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="h-4 bg-slate-800/50 rounded w-2/3" />
                <div className="h-8 bg-slate-800/30 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
            <Car className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No vehicles found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
            We couldn't find any vehicles matching your filter criteria. Try adjusting your search term, category, or status filter.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-5"
            onClick={() =>
              setFilters({
                category: "all",
                search: "",
                status: "all",
                sortBy: "default",
              })
            }
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onBookingSuccess={loadVehicles}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">
          Loading fleet catalog...
        </div>
      }
    >
      <VehiclesContent />
    </Suspense>
  );
}
