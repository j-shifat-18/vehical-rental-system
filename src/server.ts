import express, { Request, Response } from "express";
import config from "./config";
import initDB from "./config/db";
import { userRoutes } from "./modules/user/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { vehicleRoutes } from "./modules/vehicle/vehicle.routes";
import { bookingRoutes } from "./modules/booking/booking .routes";


const app = express();
const port = config.port;

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
  res.send('Vehical rental system')
})
app.get('/api/v1', (req : Request, res : Response) => {
  res.send('Vehical rental system running')
})

const server = app.listen(3001, () => {
  console.log("Example app listening on port 3001");
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

