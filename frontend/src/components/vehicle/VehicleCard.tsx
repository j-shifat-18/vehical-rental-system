"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Vehicle } from "@/lib/types";
import { formatCurrency, getVehicleImage } from "@/lib/utils";
import { VehicleStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BookingModal } from "./BookingModal";
import { motion } from "framer-motion";
import { Calendar, Hash, Shield, Sparkles } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  onBookingSuccess?: () => void;
}

export function VehicleCard({ vehicle, onBookingSuccess }: VehicleCardProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const imageUrl = vehicle.image_url || getVehicleImage(vehicle.type, vehicle.id);

  const isAvailable = vehicle.availability_status === "available";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className="group relative flex flex-col rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-emerald-950/20 backdrop-blur-sm"
      >
        {/* Top Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
          <Image
            src={imageUrl}
            alt={vehicle.vehicle_name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white border border-white/10">
              {vehicle.type}
            </span>
            <VehicleStatusBadge status={vehicle.availability_status} />
          </div>

          {/* Bottom subtle gradient */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
        </div>

        {/* Vehicle Body Info */}
        <div className="flex-1 p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                {vehicle.vehicle_name}
              </h3>
            </div>

            <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1 bg-slate-800/60 px-2 py-1 rounded-md border border-white/5">
                <Hash className="w-3 h-3 text-slate-500" />
                <span className="font-mono text-[11px] text-slate-300">
                  {vehicle.registration_number}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400/90">
                <Sparkles className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          {/* Pricing & Action */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-medium">
                Daily Rate
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-white">
                  {formatCurrency(vehicle.daily_rent_price)}
                </span>
                <span className="text-xs text-slate-400">/day</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/vehicles/${vehicle.id}`}>
                <Button variant="secondary" size="sm">
                  Details
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                disabled={!isAvailable}
                onClick={() => setIsBookingModalOpen(true)}
              >
                {isAvailable ? "Book" : "Booked"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Booking Modal */}
      <BookingModal
        vehicle={vehicle}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          setIsBookingModalOpen(false);
          onBookingSuccess?.();
        }}
      />
    </>
  );
}
