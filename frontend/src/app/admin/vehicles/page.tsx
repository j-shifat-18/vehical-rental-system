"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { VehicleStatusBadge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { AvailabilityStatus, Vehicle, VehicleType } from "@/lib/types";
import { formatCurrency, getVehicleImage } from "@/lib/utils";
import {
  Car,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Hash,
  DollarSign,
} from "lucide-react";

export default function AdminVehiclesPage() {
  const router = useRouter();
  const { isAuthenticated, role, isLoading: isAuthLoading } = useAuth();
  const { success, error } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<VehicleType>("car");
  const [formReg, setFormReg] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStatus, setFormStatus] = useState<AvailabilityStatus>("available");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await api.vehicles.getAll();
      if (res.success && res.data) {
        setVehicles(res.data);
      }
    } catch (e: any) {
      error("Error", "Failed to retrieve vehicle inventory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === "admin") {
      loadVehicles();
    }
  }, [isAuthenticated, role]);

  const openCreateModal = () => {
    setEditingVehicle(null);
    setFormName("");
    setFormType("car");
    setFormReg("");
    setFormPrice("");
    setFormStatus("available");
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormName(v.vehicle_name);
    setFormType(v.type);
    setFormReg(v.registration_number);
    setFormPrice(String(v.daily_rent_price));
    setFormStatus(v.availability_status);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      error("Invalid Rate", "Daily rent price must be a positive number.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingVehicle) {
        // Update vehicle
        const res = await api.vehicles.update(editingVehicle.id, {
          vehicle_name: formName.trim(),
          type: formType,
          registration_number: formReg.trim(),
          daily_rent_price: priceNum,
          availability_status: formStatus,
        });

        if (res.success) {
          success("Vehicle Updated", "Vehicle records have been saved.");
          setIsModalOpen(false);
          loadVehicles();
        } else {
          error("Update Failed", res.message || res.errors || "Failed to update vehicle.");
        }
      } else {
        // Create vehicle
        const res = await api.vehicles.create({
          vehicle_name: formName.trim(),
          type: formType,
          registration_number: formReg.trim(),
          daily_rent_price: priceNum,
          availability_status: formStatus,
        });

        if (res.success) {
          success("Vehicle Added", `${formName} added to the fleet inventory.`);
          setIsModalOpen(false);
          loadVehicles();
        } else {
          error("Creation Failed", res.message || res.errors || "Failed to register vehicle.");
        }
      }
    } catch (err: any) {
      error("Error", err?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVehicle) return;

    setIsDeleting(true);
    try {
      const res = await api.vehicles.delete(deletingVehicle.id);
      if (res.success) {
        success("Vehicle Removed", "The vehicle was deleted from inventory.");
        setDeletingVehicle(null);
        loadVehicles();
      } else {
        error("Cannot Delete Vehicle", res.message || res.errors || "This vehicle has active bookings.");
      }
    } catch (err: any) {
      error("Delete Failed", err?.message || "Server error while deleting vehicle.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (typeFilter !== "all" && v.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          v.vehicle_name.toLowerCase().includes(q) ||
          v.registration_number.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vehicles, typeFilter, search]);

  if (isAuthLoading || (isAuthenticated && role !== "admin")) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
            Admin Management
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Fleet Inventory Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add new cars, bikes, vans and SUVs, configure rates, and monitor availability status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadVehicles}
            isLoading={isLoading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Vehicle
          </Button>
        </div>
      </div>

      <AdminNav />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 glass-panel p-3.5 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search vehicle name or registration plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Vehicle Types</option>
            <option value="car">Cars</option>
            <option value="SUV">SUVs</option>
            <option value="bike">Bikes</option>
            <option value="van">Vans</option>
          </select>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {filteredVehicles.length} of {vehicles.length}
          </span>
        </div>
      </div>

      {/* Vehicles Table Card */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Loading vehicle records...
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Car className="w-10 h-10 text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-white">No vehicles found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              No vehicles matched your query. Click "Add New Vehicle" to add one to the fleet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Registration</th>
                  <th className="py-3.5 px-4">Daily Rent</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredVehicles.map((v) => {
                  const img = v.image_url || getVehicleImage(v.type, v.id);
                  return (
                    <tr key={v.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-8 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                            <Image
                              src={img}
                              alt={v.vehicle_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{v.vehicle_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID #{v.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/5">
                          {v.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-200">
                        {v.registration_number}
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-400 text-sm">
                        {formatCurrency(v.daily_rent_price)}
                        <span className="text-[10px] text-slate-400 font-normal"> /day</span>
                      </td>
                      <td className="py-3 px-4">
                        <VehicleStatusBadge status={v.availability_status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(v)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Edit Vehicle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingVehicle(v)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                            title="Delete Vehicle"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? `Edit ${editingVehicle.vehicle_name}` : "Add Vehicle to Fleet"}
        description="Fill in the registration, classification, and daily rate specifications."
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <Input
            label="Vehicle Name / Model"
            placeholder="e.g. Tesla Model 3 Long Range"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            icon={<Car className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Vehicle Category"
              value={formType}
              onChange={(e) => setFormType(e.target.value as VehicleType)}
              options={[
                { label: "Car (Sedan/Hatchback)", value: "car" },
                { label: "SUV (All-Terrain)", value: "SUV" },
                { label: "Bike (Motorcycle/Cruiser)", value: "bike" },
                { label: "Van (Passenger/Cargo)", value: "van" },
              ]}
            />

            <Select
              label="Availability Status"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as AvailabilityStatus)}
              options={[
                { label: "Available for Rent", value: "available" },
                { label: "Booked / Out on Rental", value: "booked" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Registration / License Plate"
              placeholder="e.g. DHA-GA-1234"
              value={formReg}
              onChange={(e) => setFormReg(e.target.value)}
              required
              icon={<Hash className="w-4 h-4" />}
            />

            <Input
              label="Daily Rent Price ($ USD)"
              type="number"
              step="0.01"
              min="1"
              placeholder="e.g. 75"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              required
              icon={<DollarSign className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingVehicle ? "Save Changes" : "Create Vehicle"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingVehicle}
        onClose={() => setDeletingVehicle(null)}
        title="Delete Vehicle from Fleet?"
        description="Are you sure you want to permanently delete this vehicle? Note: Vehicles with active bookings cannot be removed."
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          {deletingVehicle && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <strong className="text-white block">{deletingVehicle.vehicle_name}</strong>
              <span className="text-slate-400">Plate: {deletingVehicle.registration_number}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeletingVehicle(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Delete Vehicle
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
