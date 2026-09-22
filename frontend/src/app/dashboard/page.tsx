"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Booking, User } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Car,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  Ban,
  User as UserIcon,
  Phone,
  Mail,
  Shield,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading, updateUser } = useAuth();
  const { success, error } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  // Cancellation modal state
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Profile edit state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Set profile form values
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  const loadBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const res = await api.bookings.getAll();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load user bookings", err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated]);

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;

    setIsCancelling(true);
    try {
      const res = await api.bookings.update(cancellingBooking.id, {
        status: "cancelled",
      });

      if (res.success) {
        success(
          "Booking Cancelled",
          "Your reservation has been cancelled and vehicle availability released."
        );
        setCancellingBooking(null);
        loadBookings();
      } else {
        error("Cancellation Failed", res.message || res.errors || "Cannot cancel booking.");
      }
    } catch (err: any) {
      error("Error", err?.message || "Failed to cancel booking.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingProfile(true);
    try {
      const res = await api.users.update(user.id, {
        name: profileName.trim(),
        phone: profilePhone.trim(),
      });

      if (res.success && res.data) {
        updateUser({ name: profileName, phone: profilePhone });
        success("Profile Updated", "Your information has been successfully saved.");
      } else {
        error("Update Failed", res.message || "Failed to update profile.");
      }
    } catch (err: any) {
      error("Error", err?.message || "Something went wrong.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Metrics
  const activeCount = bookings.filter((b) => b.status === "active").length;
  const returnedCount = bookings.filter((b) => b.status === "returned").length;
  const totalSpent = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + parseFloat(String(b.total_price || 0)), 0);

  if (isAuthLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading customer dashboard...
      </div>
    );
  }

  const today = new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
            Customer Dashboard
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal vehicle reservations, view rental invoices, and edit account settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBookings}
            isLoading={isLoadingBookings}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Bookings
          </Button>
          <Link href="/vehicles">
            <Button variant="primary" size="sm">
              <Car className="w-3.5 h-3.5 mr-1" />
              Rent A Vehicle
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-400">Total Bookings</span>
          <span className="text-2xl font-black text-white">{bookings.length}</span>
          <span className="text-[11px] text-slate-400 mt-1">Lifetime trips created</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-1">
          <span className="text-xs font-medium text-cyan-400">Active Bookings</span>
          <span className="text-2xl font-black text-cyan-400">{activeCount}</span>
          <span className="text-[11px] text-slate-400 mt-1">Ready for pickup / in use</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-1">
          <span className="text-xs font-medium text-emerald-400">Completed Trips</span>
          <span className="text-2xl font-black text-emerald-400">{returnedCount}</span>
          <span className="text-[11px] text-slate-400 mt-1">Returned vehicles</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-400">Total Spent</span>
          <span className="text-2xl font-black text-white">{formatCurrency(totalSpent)}</span>
          <span className="text-[11px] text-slate-400 mt-1">Non-cancelled rentals</span>
        </div>
      </div>

      {/* Main Content: Bookings List + Profile Edit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Bookings List (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              My Vehicle Reservations
            </h2>
            <span className="text-xs text-slate-400">
              {bookings.length} record{bookings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoadingBookings ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-900/40 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/30 border border-slate-800 flex flex-col items-center">
              <Car className="w-10 h-10 text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white">No Bookings Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                You haven't made any vehicle reservations yet. Browse our verified fleet to get started!
              </p>
              <Link href="/vehicles" className="mt-4">
                <Button variant="primary" size="sm">
                  Explore Vehicles
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.map((booking) => {
                const startDate = new Date(booking.rent_start_date);
                const canCancel = booking.status === "active" && startDate > today;

                return (
                  <div
                    key={booking.id}
                    className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h4 className="text-base font-bold text-white">
                          {booking.vehicle?.vehicle_name || `Vehicle #${booking.vehicle_id}`}
                        </h4>
                        <BookingStatusBadge status={booking.status} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 mt-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {formatDate(booking.rent_start_date)} — {formatDate(booking.rent_end_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono text-[11px] text-slate-300">
                            Reg: {booking.vehicle?.registration_number || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">
                          Total Price
                        </span>
                        <span className="text-base font-black text-emerald-400">
                          {formatCurrency(booking.total_price)}
                        </span>
                      </div>

                      {booking.status === "active" && (
                        <div>
                          {canCancel ? (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setCancellingBooking(booking)}
                            >
                              <Ban className="w-3.5 h-3.5 mr-1" />
                              Cancel
                            </Button>
                          ) : (
                            <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 block text-center">
                              In-progress
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile Management Card (1 col) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-5">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-emerald-400" />
              Profile Details
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Keep your contact information updated for pickup notifications.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              required
              icon={<UserIcon className="w-4 h-4" />}
            />

            <Input
              label="Email Address (Locked)"
              value={user.email}
              disabled
              hint="Account identifier"
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Phone Number"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              required
              icon={<Phone className="w-4 h-4" />}
            />

            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Account Role: <strong className="text-white capitalize">{user.role}</strong>
              </span>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="md"
              isLoading={isUpdatingProfile}
              className="w-full mt-1"
            >
              Save Profile Changes
            </Button>
          </form>
        </div>
      </div>

      {/* Booking Cancellation Confirmation Modal */}
      <Modal
        isOpen={!!cancellingBooking}
        onClose={() => setCancellingBooking(null)}
        title="Cancel Vehicle Reservation?"
        description="Are you sure you want to cancel this booking? This will immediately free the vehicle for other customers."
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          {cancellingBooking && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col gap-1.5">
              <div className="text-white font-semibold">
                {cancellingBooking.vehicle?.vehicle_name || "Vehicle"}
              </div>
              <div className="text-slate-400">
                Duration: {formatDate(cancellingBooking.rent_start_date)} to{" "}
                {formatDate(cancellingBooking.rent_end_date)}
              </div>
              <div className="text-emerald-400 font-bold">
                Refund/Void Amount: {formatCurrency(cancellingBooking.total_price)}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCancellingBooking(null)}
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleCancelBooking}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
