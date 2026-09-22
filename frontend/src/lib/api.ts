import { ApiResponse, AuthResponse, Booking, User, Vehicle } from "./types";

function getPrimaryApiUrl(): string {
  if (typeof window !== "undefined") {
    // If accessing via Nginx (port 80 or standard HTTP port), route directly through Nginx
    if (window.location.port === "" || window.location.port === "80") {
      return "/api/v1";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
}

const FALLBACK_API_URL =
  process.env.NEXT_PUBLIC_FALLBACK_API_URL ||
  "https://vehical-rental-system-five.vercel.app/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vrs_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const primaryApiUrl = getPrimaryApiUrl();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Try primary URL first
  try {
    const res = await fetch(`${primaryApiUrl}${cleanEndpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    return data;
  } catch (primaryErr) {
    // If local is down or unreachable, gracefully try fallback API
    console.warn(
      `Primary API (${primaryApiUrl}) failed, trying fallback API...`,
      primaryErr
    );

    try {
      const resFallback = await fetch(`${FALLBACK_API_URL}${cleanEndpoint}`, {
        ...options,
        headers,
      });
      const data = await resFallback.json();
      return data;
    } catch (fallbackErr: any) {
      return {
        success: false,
        message: "Failed to connect to server. Please check your connection or backend.",
        errors: fallbackErr?.message || "Network error",
      };
    }
  }
}

export const api = {
  // Authentication
  auth: {
    signup: (data: {
      name: string;
      email: string;
      password: string;
      phone: string;
      role: "customer" | "admin";
    }) => request<User>("auth/signup", { method: "POST", body: JSON.stringify(data) }),

    signin: (data: { email: string; password: string }) =>
      request<AuthResponse>("auth/signin", { method: "POST", body: JSON.stringify(data) }),
  },

  // Vehicles
  vehicles: {
    getAll: () => request<Vehicle[]>("vehicles"),
    getById: (id: string | number) => request<Vehicle>(`vehicles/${id}`),
    create: (data: Partial<Vehicle>) =>
      request<Vehicle>("vehicles", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string | number, data: Partial<Vehicle>) =>
      request<Vehicle>(`vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string | number) =>
      request<void>(`vehicles/${id}`, { method: "DELETE" }),
  },

  // Bookings
  bookings: {
    getAll: () => request<Booking[]>("bookings"),
    create: (data: {
      customer_id: number;
      vehicle_id: number;
      rent_start_date: string;
      rent_end_date: string;
    }) => request<Booking>("bookings", { method: "POST", body: JSON.stringify(data) }),
    update: (
      id: string | number,
      data: { status: "cancelled" | "returned" }
    ) => request<Booking>(`bookings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },

  // Users
  users: {
    getAll: () => request<User[]>("users"),
    update: (id: string | number, data: Partial<User>) =>
      request<User>(`users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string | number) => request<void>(`users/${id}`, { method: "DELETE" }),
  },
};
