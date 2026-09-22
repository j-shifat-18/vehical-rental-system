import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { VehicleType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function calculateRentalDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
  if (endDate <= startDate) return 0;
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Curated high-res vehicles by category for sleek visual representation
const VEHICLE_IMAGE_CATALOG: Record<VehicleType, string[]> = {
  car: [
    "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80", // Tesla Model 3
    "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=80", // Audi Sedan
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80", // BMW Sedan
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80", // Mercedes C Class
  ],
  SUV: [
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80", // Range Rover
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80", // Jeep Wrangler
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80", // Porsche Cayenne
    "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80", // Toyota Land Cruiser
  ],
  bike: [
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80", // Harley Davidson
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80", // Yamaha Sports
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=900&q=80", // Ducati
    "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=900&q=80", // Cafe Racer
  ],
  van: [
    "https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=900&q=80", // Mercedes Sprinter
    "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=900&q=80", // VW Transporter
    "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=80", // Modern Van
  ],
};

export function getVehicleImage(type?: VehicleType, vehicleId?: number): string {
  const t = type || "car";
  const pool = VEHICLE_IMAGE_CATALOG[t] || VEHICLE_IMAGE_CATALOG.car;
  const idx = Math.abs((vehicleId || 0) % pool.length);
  return pool[idx];
}
