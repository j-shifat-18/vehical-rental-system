import express, { Request, Response } from "express";
import config from "./config";
import initDB from "./config/db";
import { userRoutes } from "./modules/user/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { vehicleRoutes } from "./modules/vehicle/vehicle.routes";


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

app.get('/', (req : Request, res : Response) => {
  res.send('Vehical rental system')
})
app.get('/api/v1', (req : Request, res : Response) => {
  res.send('Vehical rental system running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
