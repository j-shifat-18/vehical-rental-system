"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/Button";
import { BookingStatusBadge, VehicleStatusBadge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { Booking, User, Vehicle } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Car,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Plus,
  ArrowRight,
  RefreshCw,
  Clock,
} from "lucide-react";

export default function AdminOverviewPage() {
  const router = useRouter();
  const { user, isAuthenticated, role, isLoading: isAuthLoading } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vRes, bRes, uRes] = await Promise.allSettled([
        api.vehicles.getAll(),
        api.bookings.getAll(),
        api.users.getAll(),
      ]);

      if (vRes.status === "fulfilled" && vRes.value.success && vRes.value.data) {
        setVehicles(vRes.value.data);
      }
      if (bRes.status === "fulfilled" && bRes.value.success && bRes.value.data) {
        setBookings(bRes.value.data);
      }
      if (uRes.status === "fulfilled" && uRes.value.success && uRes.value.data) {
        setUsers(uRes.value.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === "admin") {
      loadData();
    }
  }, [isAuthenticated, role]);

  if (isAuthLoading || (isAuthenticated && role !== "admin")) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        Verifying administrator credentials...
      </div>
    );
  }

  // Calculate metrics
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.availability_status === "available").length;
  const bookedVehicles = vehicles.filter((v) => v.availability_status === "booked").length;
  const utilizationRate =
    totalVehicles > 0 ? Math.round((bookedVehicles / totalVehicles) * 100) : 0;

  const activeBookings = bookings.filter((b) => b.status === "active").length;
  const returnedBookings = bookings.filter((b) => b.status === "returned").length;
  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + parseFloat(String(b.total_price || 0)), 0);

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Administrator Console
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Fleet Operations Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time management for vehicle inventory, rental agreements, and customer accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Link href="/admin/vehicles">
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Add Vehicle
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Submenu */}
      <AdminNav />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Fleet</span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-3xl font-black text-white">{totalVehicles}</span>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">{availableVehicles} Available</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{bookedVehicles} Booked</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Rentals</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-400">{activeBookings}</span>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span>{returnedBookings} Trips Completed</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-3xl font-black text-white">{formatCurrency(totalRevenue)}</span>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span>From {bookings.length} reservations</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="text-3xl font-black text-white">{users.length}</span>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span>Fleet utilization: {utilizationRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/vehicles"
          className="glass-panel p-6 rounded-2xl hover:border-emerald-500/40 transition-all group flex flex-col justify-between gap-4"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              Fleet Inventory Management
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Register new vehicles, configure daily rental rates, adjust availability, and edit registration details.
            </p>
          </div>
          <div className="flex items-center text-xs font-semibold text-emerald-400 gap-1.5">
            <span>Manage Inventory</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/bookings"
          className="glass-panel p-6 rounded-2xl hover:border-emerald-500/40 transition-all group flex flex-col justify-between gap-4"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              Rental Agreements & Returns
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Inspect active client bookings, mark vehicles as returned to automatically restore availability, or process cancellations.
            </p>
          </div>
          <div className="flex items-center text-xs font-semibold text-emerald-400 gap-1.5">
            <span>Review Bookings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="glass-panel p-6 rounded-2xl hover:border-emerald-500/40 transition-all group flex flex-col justify-between gap-4"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              User Accounts & Roles
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              View customer profiles, contact numbers, email directories, and manage access privileges across the system.
            </p>
          </div>
          <div className="flex items-center text-xs font-semibold text-emerald-400 gap-1.5">
            <span>Inspect Directory</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Bookings Activity Table */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Booking Activity</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest client reservations registered in the PostgreSQL database.
            </p>
          </div>
          <Link href="/admin/bookings">
            <Button variant="ghost" size="sm">
              View All ({bookings.length})
            </Button>
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            No bookings recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Rental Dates</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 font-mono text-slate-400">#{b.id}</td>
                    <td className="py-3 font-semibold text-white">
                      {b.vehicle?.vehicle_name || `Vehicle #${b.vehicle_id}`}
                    </td>
                    <td className="py-3">
                      <div>{b.customer?.name || "Customer"}</div>
                      <div className="text-[11px] text-slate-500">{b.customer?.email}</div>
                    </td>
                    <td className="py-3">
                      {formatDate(b.rent_start_date)} — {formatDate(b.rent_end_date)}
                    </td>
                    <td className="py-3 font-bold text-emerald-400">
                      {formatCurrency(b.total_price)}
                    </td>
                    <td className="py-3">
                      <BookingStatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
