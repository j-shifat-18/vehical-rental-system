export type UserRole = "customer" | "admin";

export type VehicleType = "car" | "bike" | "van" | "SUV";

export type AvailabilityStatus = "available" | "booked";

export type BookingStatus = "active" | "cancelled" | "returned";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Vehicle {
  id: number;
  vehicle_name: string;
  type: VehicleType;
  registration_number: string;
  daily_rent_price: number | string;
  availability_status: AvailabilityStatus;
  image_url?: string;
}

export interface Booking {
  id: number;
  customer_id?: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
  total_price: number | string;
  status: BookingStatus;
  customer?: {
    name: string;
    email: string;
  };
  vehicle?: {
    vehicle_name: string;
    registration_number: string;
    type?: VehicleType;
    daily_rent_price?: number | string;
    availability_status?: AvailabilityStatus;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
