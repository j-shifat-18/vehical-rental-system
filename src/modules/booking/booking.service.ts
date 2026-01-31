import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";

const createBooking = async (payload: Record<string, unknown>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  const dailyRentResult = await pool.query(
    `SELECT DAILY_RENT_PRICE FROM VEHICLES WHERE id = $1`,
    [vehicle_id],
  );

  const daily_rent = dailyRentResult.rows[0].daily_rent_price;

  const rentStartDay = new Date(rent_start_date as string);
  const rentEndDay = new Date(rent_end_date as string);

  if (rentEndDay <= rentStartDay) {
    throw new Error("Rent end date must be after start date");
  }

  const daysInMs = rentEndDay.getTime() - rentStartDay.getTime();
  const totalRentDays = daysInMs / (1000 * 60 * 60 * 24);

  const totalPrice = daily_rent * totalRentDays;

  const result = await pool.query(
    `INSERT INTO BOOKINGS (CUSTOMER_ID ,VEHICLE_ID , RENT_START_DATE , RENT_END_DATE , TOTAL_PRICE , STATUS ) VALUES ($1 , $2 , $3 , $4 , $5 , $6) RETURNING *`,
    [
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      totalPrice,
      "active",
    ],
  );

  return result;
};

const getBookings = async (user: JwtPayload) => {
  const { role, email } = user;

  if (role === "admin") {
    const result = await pool.query(`SELECT * FROM BOOKINGS`);

    return result.rows;
  }

  if (role === "customer") {
    const result = await pool.query(
      `SELECT * FROM BOOKINGS b JOIN USERS u ON b.customer_id = u.id WHERE u.email = $1`,
      [email],
    );

    return result.rows;
  }
};

const updateBooking = async (
  user: JwtPayload,
  bookingId: string,
  payload: Record<string, unknown>,
) => {
  const { status } = payload;

  if (user.role === "admin") {
    if (status === "cancelled" || status === "returned") {
      const result  = await pool.query(`UPDATE BOOKINGS SET status = $1 WHERE ID = $2 RETURNING *` , [status ,bookingId ]) ;

        return result.rows[0];
    }
  }

  if (user.role === "customer") {
    if (status === "cancelled") {
      const result  = await pool.query(`UPDATE BOOKINGS SET status = $1 WHERE ID = $2 RETURNING *` , [status ,bookingId ]) ;

        return result.rows[0];
    }
  }


  
};
export const bookingServices = {
  createBooking,
  getBookings,
  updateBooking
};
