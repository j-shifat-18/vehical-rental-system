"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Vehicle } from "@/lib/types";
import { api } from "@/lib/api";
import {
  calculateRentalDays,
  formatCurrency,
  getVehicleImage,
} from "@/lib/utils";
import { VehicleStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Shield,
  Sparkles,
  Zap,
  Users,
  Gauge,
  Fuel,
  AlertCircle,
} from "lucide-react";

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const vehicleId = unwrappedParams.id;
  const router = useRouter();

  const { user, isAuthenticated, quickDemoLogin } = useAuth();
  const { success, error } = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuickLoggingIn, setIsQuickLoggingIn] = useState(false);

  // Date selections for booking
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endDefault = new Date(tomorrow);
  endDefault.setDate(endDefault.getDate() + 3);

  const formatDateValue = (d: Date) => d.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDateValue(tomorrow));
  const [endDate, setEndDate] = useState(formatDateValue(endDefault));

  const loadVehicle = async () => {
    setIsLoading(true);
    try {
      const res = await api.vehicles.getById(vehicleId);
      if (res.success && res.data) {
        setVehicle(res.data);
      } else {
        error("Vehicle not found", res.message);
      }
    } catch (err: any) {
      error("Error", "Failed to fetch vehicle information.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicle();
  }, [vehicleId]);

  const rentalDays = calculateRentalDays(startDate, endDate);
  const dailyRate = vehicle
    ? typeof vehicle.daily_rent_price === "string"
      ? parseFloat(vehicle.daily_rent_price)
      : vehicle.daily_rent_price
    : 0;
  const totalPrice = rentalDays * dailyRate;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicle) return;

    if (!isAuthenticated || !user) {
      error("Sign In Required", "Please sign in as a customer to book this vehicle.");
      return;
    }

    if (rentalDays <= 0) {
      error("Invalid Dates", "Return date must be strictly after the start date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.bookings.create({
        customer_id: user.id,
        vehicle_id: vehicle.id,
        rent_start_date: startDate,
        rent_end_date: endDate,
      });

      if (res.success) {
        success(
          "Reservation Successful!",
          `You have booked ${vehicle.vehicle_name}. Redirecting to your dashboard...`
        );
        router.push("/dashboard");
      } else {
        error("Booking Failed", res.message || res.errors || "Reservation failed.");
      }
    } catch (err: any) {
      error("Booking Error", err?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickCustomerAuth = async () => {
    setIsQuickLoggingIn(true);
    try {
      const ok = await quickDemoLogin("customer");
      if (ok) {
        success("Signed In", "Signed in with Demo Customer account.");
      } else {
        error("Demo Auth Failed", "Could not sign in with demo customer.");
      }
    } finally {
      setIsQuickLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-800/40 rounded-3xl" />
          <div className="h-96 bg-slate-800/40 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Vehicle Not Found</h2>
        <p className="text-xs text-slate-400 mt-2">
          The requested vehicle does not exist or has been removed from our active fleet.
        </p>
        <Link href="/vehicles" className="inline-block mt-6">
          <Button variant="secondary">Back to Fleet Explorer</Button>
        </Link>
      </div>
    );
  }

  const isAvailable = vehicle.availability_status === "available";
  const imageUrl = vehicle.image_url || getVehicleImage(vehicle.type, vehicle.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Back button */}
      <div>
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fleet Explorer</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Image & Specs */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main Visual Image Banner */}
          <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            <Image
              src={imageUrl}
              alt={vehicle.vehicle_name}
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white border border-white/10">
                {vehicle.type}
              </span>
              <VehicleStatusBadge status={vehicle.availability_status} />
            </div>
          </div>

          {/* Title & Registration Bar */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-1">
                Verified Fleet ID #{vehicle.id}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {vehicle.vehicle_name}
              </h1>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                <span className="font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-white/5">
                  Plate: {vehicle.registration_number}
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Premium Inspection Passed
                </span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">
                Daily Rent
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {formatCurrency(vehicle.daily_rent_price)}
                <span className="text-xs font-normal text-slate-400"> /day</span>
              </div>
            </div>
          </div>

          {/* Vehicle Feature Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel-subtle p-4 rounded-xl flex flex-col gap-1.5">
              <div className="text-slate-400 flex items-center gap-1.5 text-xs">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Transmission</span>
              </div>
              <span className="text-sm font-bold text-white">Automatic</span>
            </div>

            <div className="glass-panel-subtle p-4 rounded-xl flex flex-col gap-1.5">
              <div className="text-slate-400 flex items-center gap-1.5 text-xs">
                <Fuel className="w-4 h-4 text-emerald-400" />
                <span>Fuel Policy</span>
              </div>
              <span className="text-sm font-bold text-white">Full to Full</span>
            </div>

            <div className="glass-panel-subtle p-4 rounded-xl flex flex-col gap-1.5">
              <div className="text-slate-400 flex items-center gap-1.5 text-xs">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Capacity</span>
              </div>
              <span className="text-sm font-bold text-white">
                {vehicle.type === "bike" ? "2 Riders" : vehicle.type === "van" ? "8 Seats" : "5 Seats"}
              </span>
            </div>

            <div className="glass-panel-subtle p-4 rounded-xl flex flex-col gap-1.5">
              <div className="text-slate-400 flex items-center gap-1.5 text-xs">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Insurance</span>
              </div>
              <span className="text-sm font-bold text-white">Full Coverage</span>
            </div>
          </div>

          {/* Included Rental Perks */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Included With This Rental
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero cancellation fee prior to start date</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7 Nationwide roadside assistance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thoroughly sanitized before every handover</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-time digital agreement & zero deposit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Booking Calculator Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 sticky top-24 shadow-2xl flex flex-col gap-5">
          <div className="pb-4 border-b border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
              Live Reservation
            </span>
            <h2 className="text-lg font-bold text-white">Book Schedule</h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose your dates to calculate live duration and guaranteed price.
            </p>
          </div>

          <form onSubmit={handleBooking} className="flex flex-col gap-4">
            <div>
              <label htmlFor="detail-pickup-date" className="block text-xs font-medium text-slate-300 mb-1">
                Pickup Date
              </label>
              <Input
                id="detail-pickup-date"
                type="date"
                value={startDate}
                min={formatDateValue(today)}
                onChange={(e) => setStartDate(e.target.value)}
                required
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>

            <div>
              <label htmlFor="detail-return-date" className="block text-xs font-medium text-slate-300 mb-1">
                Return Date
              </label>
              <Input
                id="detail-return-date"
                type="date"
                value={endDate}
                min={startDate || formatDateValue(tomorrow)}
                onChange={(e) => setEndDate(e.target.value)}
                required
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>

            {/* Price breakdown calculation */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Rental Duration</span>
                <span className="font-semibold text-slate-200">
                  {rentalDays > 0 ? `${rentalDays} Days` : "Invalid dates"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Daily Rent</span>
                <span className="font-mono text-slate-300">
                  {formatCurrency(vehicle.daily_rent_price)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Security Deposit</span>
                <span className="text-emerald-400 font-semibold">$0.00 (Waived)</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Total Amount</span>
                <span className="text-xl font-black text-emerald-400">
                  {rentalDays > 0 ? formatCurrency(totalPrice) : "$0.00"}
                </span>
              </div>
            </div>

            {/* Auth status & prompt */}
            {!isAuthenticated ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-200">
                    Sign in to complete your reservation.
                  </p>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs"
                    isLoading={isQuickLoggingIn}
                    onClick={handleQuickCustomerAuth}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Demo Sign In
                  </Button>
                  <Link href="/login" className="flex-1">
                    <Button type="button" variant="outline" size="sm" className="w-full text-xs">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">
                  Signed in as <strong>{user?.name}</strong>
                </span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!isAvailable || !isAuthenticated || rentalDays <= 0}
              isLoading={isSubmitting}
              className="w-full mt-2"
            >
              {isAvailable ? "Reserve Now" : "Currently Unavailable"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
