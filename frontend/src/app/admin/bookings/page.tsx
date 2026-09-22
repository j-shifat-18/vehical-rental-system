"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/Button";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { Booking } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar,
  Search,
  RefreshCw,
  CheckCircle2,
  Ban,
  Car,
  User,
  Filter,
} from "lucide-react";

export default function AdminBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, role, isLoading: isAuthLoading } = useAuth();
  const { success, error } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Action modal state: return or cancel
  const [actionBooking, setActionBooking] = useState<{
    booking: Booking;
    type: "returned" | "cancelled";
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [isAuthLoading, isAuthenticated, role, router]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.bookings.getAll();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (e: any) {
      error("Error", "Failed to retrieve booking agreements.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === "admin") {
      loadBookings();
    }
  }, [isAuthenticated, role]);

  const handleStatusUpdate = async () => {
    if (!actionBooking) return;

    setIsUpdating(true);
    try {
      const res = await api.bookings.update(actionBooking.booking.id, {
        status: actionBooking.type,
      });

      if (res.success) {
        if (actionBooking.type === "returned") {
          success(
            "Vehicle Returned",
            "Booking marked as returned. Vehicle availability has been restored to available."
          );
        } else {
          success("Booking Cancelled", "The booking has been marked as cancelled.");
        }
        setActionBooking(null);
        loadBookings();
      } else {
        error("Update Failed", res.message || res.errors || "Failed to update booking.");
      }
    } catch (err: any) {
      error("Error", err?.message || "Failed to process booking update.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const customerName = b.customer?.name?.toLowerCase() || "";
        const customerEmail = b.customer?.email?.toLowerCase() || "";
        const vehicleName = b.vehicle?.vehicle_name?.toLowerCase() || "";
        const regNumber = b.vehicle?.registration_number?.toLowerCase() || "";
        return (
          customerName.includes(q) ||
          customerEmail.includes(q) ||
          vehicleName.includes(q) ||
          regNumber.includes(q)
        );
      }
      return true;
    });
  }, [bookings, statusFilter, search]);

  if (isAuthLoading || (isAuthenticated && role !== "admin")) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
            Admin Console
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Rental Agreements & Returns
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review customer bookings, confirm returned fleet vehicles, and manage rental statuses.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadBookings}
          isLoading={isLoading}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Bookings
        </Button>
      </div>

      <AdminNav />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 glass-panel p-3.5 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by customer, email, vehicle, or plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Booking Statuses</option>
            <option value="active">Active Rentals</option>
            <option value="returned">Returned / Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {filteredBookings.length} records
          </span>
        </div>
      </div>

      {/* Bookings Table Card */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Loading reservations...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Calendar className="w-10 h-10 text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-white">No bookings found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              No rental reservations match your query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Booking</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Rental Window</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{b.id}</td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{b.customer?.name || "Customer"}</div>
                      <div className="text-[11px] text-slate-400">{b.customer?.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {b.vehicle?.vehicle_name || `Vehicle #${b.vehicle_id}`}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {b.vehicle?.registration_number || "N/A"}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200">
                        {formatDate(b.rent_start_date)} — {formatDate(b.rent_end_date)}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-black text-emerald-400">
                      {formatCurrency(b.total_price)}
                    </td>

                    <td className="py-3 px-4">
                      <BookingStatusBadge status={b.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      {b.status === "active" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-[11px] py-1 px-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30"
                            onClick={() =>
                              setActionBooking({ booking: b, type: "returned" })
                            }
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Mark Returned
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] py-1 px-2.5 text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                            onClick={() =>
                              setActionBooking({ booking: b, type: "cancelled" })
                            }
                          >
                            <Ban className="w-3.5 h-3.5 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!actionBooking}
        onClose={() => setActionBooking(null)}
        title={
          actionBooking?.type === "returned"
            ? "Mark Vehicle as Returned?"
            : "Cancel This Booking?"
        }
        description={
          actionBooking?.type === "returned"
            ? "Marking as returned will automatically update the vehicle's availability status back to 'available' in the fleet."
            : "Cancelling will terminate this booking and restore the vehicle to available."
        }
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          {actionBooking && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col gap-1">
              <span className="text-white font-semibold">
                Booking #{actionBooking.booking.id}
              </span>
              <span className="text-slate-400">
                Customer: {actionBooking.booking.customer?.name} ({actionBooking.booking.customer?.email})
              </span>
              <span className="text-slate-400">
                Vehicle: {actionBooking.booking.vehicle?.vehicle_name} (
                {actionBooking.booking.vehicle?.registration_number})
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setActionBooking(null)}>
              Dismiss
            </Button>
            <Button
              variant={actionBooking?.type === "returned" ? "primary" : "danger"}
              size="sm"
              isLoading={isUpdating}
              onClick={handleStatusUpdate}
            >
              Confirm {actionBooking?.type === "returned" ? "Return" : "Cancellation"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
