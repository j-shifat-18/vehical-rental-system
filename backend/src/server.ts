import express, { Request, Response } from "express";
import cors from "cors";
import config from "./config";
import initDB from "./config/db";
import { userRoutes } from "./modules/user/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { vehicleRoutes } from "./modules/vehicle/vehicle.routes";
import { bookingRoutes } from "./modules/booking/booking.routes";


const app = express();
const port = config.port;

// Universal CORS & Preflight Handler
app.use((req: Request, res: Response, next: express.NextFunction) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
  );

  const requestHeaders = req.headers["access-control-request-headers"];
  if (requestHeaders) {
    res.setHeader("Access-Control-Allow-Headers", requestHeaders);
  } else {
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma"
    );
  }

  res.setHeader(
    "Access-Control-Expose-Headers",
    "Authorization, Content-Length, Content-Type"
  );
  res.setHeader("Vary", "Origin, Access-Control-Request-Headers");

  // Instantly respond to preflight OPTIONS requests with 200 OK
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Also include express cors() with dynamic origin reflection
const corsOptions: cors.CorsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  exposedHeaders: ["Authorization", "Content-Length"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// parser
app.use(express.json());

// initialize database
initDB();



// auth signup / login
app.use("/api/v1/auth",authRoutes);

// user crud
app.use("/api/v1/users",userRoutes)


// vehicle crud
app.use("/api/v1/vehicles" ,vehicleRoutes)


// booking crud
app.use("/api/v1/bookings" , bookingRoutes);

app.get('/', (req : Request, res : Response) => {
  res.send('Vehicle rental system')
})
app.get('/api/v1', (req : Request, res : Response) => {
  res.send('Vehicle rental system running')
})

// 404 Not Found Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    errors: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    errors: process.env.NODE_ENV === "production" ? "Internal server error" : err.stack,
  });
});


// debug headers information

app.get("/api/v1/debug/headers", (req, res) => {
  res.json({
    host: req.headers.host,
    realIp: req.headers["x-real-ip"],
    forwardedFor: req.headers["x-forwarded-for"],
    forwardedProto: req.headers["x-forwarded-proto"],
    protocol: req.protocol,
    ip: req.ip,
  });
});

const server = app.listen( port || 3001, () => {
  console.log(`Example app listening on port ${port || 3001}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server...");
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Closing server...");
  server.close(() => {
    process.exit(0);
  });
});

