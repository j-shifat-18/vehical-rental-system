import express, { Request, Response } from "express";
import config from "./config";
import initDB from "./config/db";


const app = express();
const port = config.port;

// parser
app.use(express.json());

// initialize database
initDB();

app.get('/', (req : Request, res : Response) => {
  res.send('Vehical rental system')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
