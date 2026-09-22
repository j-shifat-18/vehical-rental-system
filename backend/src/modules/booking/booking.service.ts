import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";

const createBooking = async (payload: Record<string, unknown>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  // Check if vehicle exists and is available
  const vehicleResult = await pool.query(
    `SELECT * FROM VEHICLES WHERE id = $1`,
    [vehicle_id],
  );

  if (vehicleResult.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const vehicle = vehicleResult.rows[0];
  
  if (vehicle.availability_status !== 'available') {
    throw new Error("Vehicle not available");
  }

  const daily_rent = vehicle.daily_rent_price;

  const rentStartDay = new Date(rent_start_date as string);
  const rentEndDay = new Date(rent_end_date as string);

  if (rentEndDay <= rentStartDay) {
    throw new Error("Rent end date must be after start date");
  }

  const daysInMs = rentEndDay.getTime() - rentStartDay.getTime();
  const totalRentDays = Math.ceil(daysInMs / (1000 * 60 * 60 * 24));

  const totalPrice = daily_rent * totalRentDays;

  // Start transaction
  await pool.query('BEGIN');

  try {
    // Create booking
    const bookingResult = await pool.query(
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

    // Update vehicle availability
    await pool.query(
      `UPDATE VEHICLES SET AVAILABILITY_STATUS = 'booked' WHERE ID = $1`,
      [vehicle_id]
    );

    await pool.query('COMMIT');

    // Return booking with vehicle info
    const booking = bookingResult.rows[0];
    return {
      ...booking,
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price
      }
    };
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
};

const getBookings = async (user: JwtPayload) => {
  const { role, id: userId } = user;

  if (role === "admin") {
    const result = await pool.query(`
      SELECT 
        b.*,
        u.name as customer_name,
        u.email as customer_email,
        v.vehicle_name,
        v.registration_number
      FROM BOOKINGS b 
      JOIN USERS u ON b.customer_id = u.id 
      JOIN VEHICLES v ON b.vehicle_id = v.id
      ORDER BY b.id DESC
    `);

    return result.rows.map(row => ({
      id: row.id,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: row.total_price,
      status: row.status,
      customer: {
        name: row.customer_name,
        email: row.customer_email
      },
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number
      }
    }));
  }

  if (role === "customer") {
    const result = await pool.query(`
      SELECT 
        b.id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        v.vehicle_name,
        v.registration_number,
        v.type
      FROM BOOKINGS b 
      JOIN VEHICLES v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.id DESC
    `, [userId]);

    return result.rows.map(row => ({
      id: row.id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: row.total_price,
      status: row.status,
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
        type: row.type
      }
    }));
  }

  return [];
};

const updateBooking = async (
  user: JwtPayload,
  bookingId: string,
  payload: Record<string, unknown>,
) => {
  const { status } = payload;

  // Get booking details
  const bookingResult = await pool.query(
    `SELECT * FROM BOOKINGS WHERE ID = $1`,
    [bookingId]
  );

  if (bookingResult.rows.length === 0) {
    throw new Error("Booking not found");
  }

  const booking = bookingResult.rows[0];

  if (user.role === "customer") {
    // Customer can only update their own bookings
    if (booking.customer_id !== user.id) {
      throw new Error("Unauthorized to update this booking");
    }

    // Customer can only cancel bookings before start date
    if (status === "cancelled") {
      const today = new Date();
      const startDate = new Date(booking.rent_start_date);
      
      if (startDate <= today) {
        throw new Error("Booking cannot be cancelled after start date");
      }

      // Start transaction
      await pool.query('BEGIN');

      try {
        // Update booking status
        const result = await pool.query(
          `UPDATE BOOKINGS SET status = $1 WHERE ID = $2 RETURNING *`,
          [status, bookingId]
        );

        // Update vehicle availability
        await pool.query(
          `UPDATE VEHICLES SET AVAILABILITY_STATUS = 'available' WHERE ID = $1`,
          [booking.vehicle_id]
        );

        await pool.query('COMMIT');
        return result.rows[0];
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    }
  }

  if (user.role === "admin") {
    if (status === "cancelled" || status === "returned") {
      // Start transaction
      await pool.query('BEGIN');

      try {
        // Update booking status
        const result = await pool.query(
          `UPDATE BOOKINGS SET status = $1 WHERE ID = $2 RETURNING *`,
          [status, bookingId]
        );

        // Update vehicle availability if returned or cancelled
        await pool.query(
          `UPDATE VEHICLES SET AVAILABILITY_STATUS = 'available' WHERE ID = $1`,
          [booking.vehicle_id]
        );

        await pool.query('COMMIT');

        // Get vehicle info for response
        const vehicleResult = await pool.query(
          `SELECT availability_status FROM VEHICLES WHERE ID = $1`,
          [booking.vehicle_id]
        );

        return {
          ...result.rows[0],
          vehicle: {
            availability_status: vehicleResult.rows[0].availability_status
          }
        };
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    }
  }

  throw new Error("Invalid status update");
};

export const bookingServices = {
  createBooking,
  getBookings,
  updateBooking
};