import { pool } from "../../config/db";

const getAllVehiles = async () => {
  const result = await pool.query(`SELECT * FROM VEHICLES`);
  return result.rows;
};

const getSigleVehicle = async(id : string)=>{
    const result = await pool.query(`SELECT * FROM VEHICLES WHERE ID = $1` , [id]);
    return result.rows;
}

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

  return result.rows[0];
};

const updateVehicle = async (
  vehicleId: string,
  payload: Record<string, unknown>
) => {
  const allowedFields = [
    "vehicle_name",
    "type",
    "registration_number",
    "daily_rent_price",
    "availability_status",
  ];

  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      updates.push(`${field.toUpperCase()} = $${index}`);
      values.push(payload[field]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No valid fields provided for update");
  }

  values.push(vehicleId);

  const query = `
    UPDATE VEHICLES
    SET ${updates.join(", ")}
    WHERE ID = $${index}
    RETURNING *
  `;

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    throw new Error("Vehicle not found");
  }

  return result.rows[0];
};

const checkActiveBookings = async (vehicleId: string) => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM BOOKINGS WHERE VEHICLE_ID = $1 AND STATUS = 'active'`,
    [vehicleId]
  );
  return parseInt(result.rows[0].count);
};

const deleteVehicle = async(id : string)=>{
    const result = await pool.query(`DELETE FROM VEHICLES WHERE ID = $1` , [id]);
    return result;
}

export const vehicleServices = {
  getAllVehiles,
  createVehicle,
  getSigleVehicle,
  updateVehicle,
  deleteVehicle,
  checkActiveBookings
};