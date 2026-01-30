import { pool } from "../../config/db";

const getAllVehiles = async () => {
  const result = await pool.query(`SELECT * FROM VEHICLES`);

  return result.rows;
};


export const vehicleServices = {
    getAllVehiles,
};