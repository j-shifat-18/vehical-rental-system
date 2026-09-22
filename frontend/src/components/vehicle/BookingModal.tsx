"use client";

import React, { useState, useId } from "react";
import { Vehicle } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { calculateRentalDays, formatCurrency } from "@/lib/utils";
import { Calendar, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface BookingModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BookingModal({
  vehicle,
  isOpen,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const { user, isAuthenticated, role, quickDemoLogin } = useAuth();
  const { success, error } = useToast();

  const startDateId = useId();
  const endDateId = useId();

  // Get tomorrow and day after tomorrow as default dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(tomorrow);
  nextWeek.setDate(nextWeek.getDate() + 3);

  const formatDateValue = (d: Date) => d.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDateValue(tomorrow));
  const [endDate, setEndDate] = useState(formatDateValue(nextWeek));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuickLoggingIn, setIsQuickLoggingIn] = useState(false);

  const rentalDays = calculateRentalDays(startDate, endDate);
  const dailyRate =
    typeof vehicle.daily_rent_price === "string"
      ? parseFloat(vehicle.daily_rent_price)
      : vehicle.daily_rent_price;
  const totalPrice = rentalDays * (dailyRate || 0);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      error("Authentication Required", "Please sign in to place a booking.");
      return;
    }

    if (rentalDays <= 0) {
      error("Invalid Date Range", "Return date must be strictly after the start date.");
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
          "Booking Confirmed!",
          `You reserved ${vehicle.vehicle_name} for ${rentalDays} day(s). Total: ${formatCurrency(
            totalPrice
          )}`
        );
        onSuccess?.();
      } else {
        error("Booking Failed", res.message || res.errors || "Unable to complete reservation.");
      }
    } catch (err: any) {
      error("Booking Error", err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickCustomerAuth = async () => {
    setIsQuickLoggingIn(true);
    try {
      const ok = await quickDemoLogin("customer");
      if (ok) {
        success("Signed In", "Logged in as Demo Customer. Ready to book!");
      } else {
        error("Demo Auth Failed", "Could not sign in with demo customer.");
      }
    } finally {
      setIsQuickLoggingIn(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reserve ${vehicle.vehicle_name}`}
      description="Select your rental schedule to calculate dynamic pricing and secure your booking."
      maxWidth="md"
    >
      <form onSubmit={handleBooking} className="flex flex-col gap-5">
        {/* Vehicle Quick Summary Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              {vehicle.type} • {vehicle.registration_number}
            </span>
            <span className="text-xs text-slate-400">
              Daily rate: {formatCurrency(vehicle.daily_rent_price)}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Instant Confirmation
          </span>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={startDateId} className="block text-xs font-medium text-slate-300 mb-1.5">
              Pickup Date
            </label>
            <Input
              id={startDateId}
              type="date"
              value={startDate}
              min={formatDateValue(today)}
              onChange={(e) => setStartDate(e.target.value)}
              required
              icon={<Calendar className="w-4 h-4" />}
            />
          </div>

          <div>
            <label htmlFor={endDateId} className="block text-xs font-medium text-slate-300 mb-1.5">
              Return Date
            </label>
            <Input
              id={endDateId}
              type="date"
              value={endDate}
              min={startDate || formatDateValue(tomorrow)}
              onChange={(e) => setEndDate(e.target.value)}
              required
              icon={<Calendar className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Dynamic Pricing Calculation breakdown */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Rental Duration</span>
            <span className="font-semibold text-slate-200">
              {rentalDays > 0 ? `${rentalDays} Day${rentalDays > 1 ? "s" : ""}` : "Select valid dates"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Rate Calculation</span>
            <span className="font-mono text-slate-300">
              {rentalDays > 0 ? `${rentalDays} × ${formatCurrency(dailyRate)}` : "—"}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-sm font-bold text-white">Estimated Total</span>
            <span className="text-xl font-black text-emerald-400">
              {rentalDays > 0 ? formatCurrency(totalPrice) : "$0.00"}
            </span>
          </div>
        </div>

        {/* Auth check warning or 1-click helper */}
        {!isAuthenticated ? (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-2.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200 leading-relaxed">
                You must be signed in with a customer account to confirm your rental booking.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1 text-xs"
                isLoading={isQuickLoggingIn}
                onClick={handleQuickCustomerAuth}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                1-Click Demo Login
              </Button>
              <Link href="/login" className="flex-1">
                <Button type="button" variant="outline" size="sm" className="w-full text-xs">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Booking as: <strong className="text-white">{user?.name}</strong> ({user?.email})
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isAuthenticated || rentalDays <= 0}
            isLoading={isSubmitting}
          >
            Confirm Reservation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
