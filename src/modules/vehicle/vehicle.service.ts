import { pool } from "../../config/db";

const getAllVehiles = async () => {
  const result = await pool.query(`SELECT * FROM VEHICLES`);

  return result.rows;
};

const createVehicle = async (payload: Record<string, unknown>) => {

  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;


  const result = await pool.query(
    `INSERT INTO VEHICLES (VEHICLE_NAME , TYPE , REGISTRATION_NUMBER , DAILY_RENT_PRICE , AVAILABILITY_STATUS) VALUES ($1 , $2 , $3 , $4 , $5) RETURNING *`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );


  return result;
};

export const vehicleServices = {
  getAllVehiles,
  createVehicle,
};
