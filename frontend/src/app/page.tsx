"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Vehicle } from "@/lib/types";
import { api } from "@/lib/api";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { Button } from "@/components/ui/Button";
import {
  Car,
  Shield,
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [heroType, setHeroType] = useState("car");
  const [heroStartDate, setHeroStartDate] = useState("");
  const [heroEndDate, setHeroEndDate] = useState("");

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await api.vehicles.getAll();
      if (res.success && res.data) {
        setVehicles(res.data);
      }
    } catch (e) {
      console.error("Failed to load vehicles", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroType && heroType !== "all") params.set("type", heroType);
    router.push(`/vehicles?${params.toString()}`);
  };

  const filteredVehicles = vehicles
    .filter((v) => (selectedCategory === "all" ? true : v.type === selectedCategory))
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex flex-col items-center text-center relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide shadow-lg shadow-emerald-950/30 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Fleet Ecosystem • Transparent Rates</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]"
          >
            Drive The <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Extraordinary</span>.
            <br />
            Rent On Your Terms.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl leading-relaxed"
          >
            From executive city sedans to rugged all-terrain SUVs, high-octane motorbikes, and versatile passenger vans. Instant reservations, live pricing calculation, and complete booking flexibility.
          </motion.p>

          {/* Quick Search Bar Floating Card */}
          <motion.form
            onSubmit={handleHeroSearch}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 w-full max-w-3xl glass-panel p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="flex-1 w-full text-left px-2">
              <label htmlFor="hero-vehicle-category" className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                Vehicle Type
              </label>
              <select
                id="hero-vehicle-category"
                value={heroType}
                onChange={(e) => setHeroType(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Fleet Types</option>
                <option value="car">Executive Cars & Sedans</option>
                <option value="SUV">All-Terrain SUVs</option>
                <option value="bike">Bikes & Cruisers</option>
                <option value="van">Passenger & Utility Vans</option>
              </select>
            </div>

            <div className="flex-1 w-full text-left px-2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0">
              <label htmlFor="hero-pickup-date" className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                Pickup Date
              </label>
              <input
                id="hero-pickup-date"
                type="date"
                value={heroStartDate}
                onChange={(e) => setHeroStartDate(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex-1 w-full text-left px-2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0">
              <label htmlFor="hero-return-date" className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                Return Date
              </label>
              <input
                id="hero-return-date"
                type="date"
                value={heroEndDate}
                onChange={(e) => setHeroEndDate(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="w-full sm:w-auto pt-2 sm:pt-0">
              <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto px-6 py-3">
                <span>Find Rides</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </motion.form>

          {/* Quick Features Row */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 w-full max-w-3xl text-left">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300">Live Dynamic Pricing</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs text-slate-300">100% Verified Fleet</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-300">Flexible Cancellation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300">Zero Security Deposit</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED FLEET SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <Car className="w-4 h-4" />
              <span>Handpicked Collection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Featured Fleet Ready For The Road
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Inspect availability, vehicle specs, and book your ride directly with real-time price quotation.
            </p>
          </div>

          <Link href="/vehicles">
            <Button variant="secondary" size="sm" className="group">
              <span>View All Fleet</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
          {[
            { label: "All Fleet", value: "all" },
            { label: "Cars", value: "car" },
            { label: "SUVs", value: "SUV" },
            { label: "Bikes", value: "bike" },
            { label: "Vans", value: "van" },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.value
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                  : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid of Vehicles */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/30 border border-slate-800">
            <Car className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No vehicles found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              No vehicles match the selected category. Check back soon or visit our full catalog.
            </p>
            <Link href="/vehicles" className="inline-block mt-4">
              <Button variant="outline" size="sm">
                Browse Full Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onBookingSuccess={fetchVehicles}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" id="why-us">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
            Seamless Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            How VELOX Vehicle Rental Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Get behind the wheel in three effortless steps without paperwork friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg">
              01
            </div>
            <h3 className="text-base font-bold text-white">Choose Your Vehicle</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore our diverse fleet of verified sedans, high-performance bikes, all-wheel SUVs, and vans with transparent daily rates.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-lg">
              02
            </div>
            <h3 className="text-base font-bold text-white">Pick Schedule & Instant Quote</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select pickup and return dates. Our smart pricing engine calculates the exact total with zero hidden costs or surprise surcharges.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-lg">
              03
            </div>
            <h3 className="text-base font-bold text-white">Hit The Open Road</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive your confirmed reservation instantly. Manage, review, or cancel upcoming trips anytime straight from your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-cyan-950/70 border border-emerald-500/20 p-8 sm:p-14 text-center flex flex-col items-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-3">
            Ready For Your Next Journey?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight max-w-2xl">
            Book Your Next Rental Vehicle in Under Two Minutes
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
            Join thousands of happy drivers enjoying our modern, reliable rental platform.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <Link href="/vehicles">
              <Button variant="primary" size="lg">
                Explore Available Fleet
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" size="lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
