import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";

const getAllUsers = async () => {
  const result = await pool.query(`SELECT ID, NAME, EMAIL, PHONE, ROLE FROM USERS`);
  return result.rows;
};

const checkActiveBookings = async (userId: string) => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM BOOKINGS WHERE CUSTOMER_ID = $1 AND STATUS = 'active'`,
    [userId]
  );
  return parseInt(result.rows[0].count);
};

const deleteUser = async (id: string) => {
  const result = await pool.query(`DELETE FROM USERS WHERE ID = $1`, [id]);
  return result;
};

const updateUser = async (
  user: JwtPayload,
  userId: string,
  payload: Record<string, unknown>,
) => {
  const allowedFieldsForAdmin = ["name", "email", "phone", "role"];
  const allowedFieldsForCustomer = ["name", "email", "phone"];

  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  // Check if user exists
  const userExists = await pool.query(`SELECT * FROM USERS WHERE ID = $1`, [userId]);
  if (userExists.rows.length === 0) {
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    // Admin can update any user
    for (const field of allowedFieldsForAdmin) {
      if (payload[field] !== undefined) {
        updates.push(`${field.toUpperCase()} = $${index}`);
        values.push(payload[field]);
        index++;
      }
    }
  } else if (user.role === "customer") {
    // Customer can only update their own profile
    if (userExists.rows[0].id !== user.id) {
      throw new Error("Unauthorized to update this user");
    }
    
    for (const field of allowedFieldsForCustomer) {
      if (payload[field] !== undefined) {
        updates.push(`${field.toUpperCase()} = $${index}`);
        values.push(payload[field]);
        index++;
      }
    }
  }

  if (updates.length === 0) {
    throw new Error("No valid fields provided for update");
  }

  values.push(userId);

  const query = `
    UPDATE USERS
    SET ${updates.join(", ")}
    WHERE ID = $${index}
    RETURNING ID, NAME, EMAIL, PHONE, ROLE
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const userServices = {
  getAllUsers,
  deleteUser,
  updateUser,
  checkActiveBookings,
};