import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";

const getAllUsers = async (payload: Record<string, unknown>) => {
  const result = await pool.query(`SELECT * FROM USERS`);

  return result.rows;
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

  if (user.role === "admin") {
    for (const field of allowedFieldsForAdmin) {
      if (payload[field] !== undefined) {
        updates.push(`${field.toUpperCase()} = $${index}`);
        values.push(payload[field]);
        index++;
      }
    }
  }

  if (user.role === "customer") {
    const userEmailResult = await pool.query(
      `SELECT email FROM USERS WHERE id = $1`,
      [userId],
    );

    const userEmail = userEmailResult.rows[0].email;
    console.log(userEmail);

    if (userEmail === user.email) {
      for (const field of allowedFieldsForCustomer) {
        if (payload[field] !== undefined) {
          updates.push(`${field.toUpperCase()} = $${index}`);
          values.push(payload[field]);
          index++;
        }
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
    RETURNING *
  `;

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    throw new Error("Vehicle not found");
  }

  return result.rows[0];
};

export const userServices = {
  getAllUsers,
  deleteUser,
  updateUser,
};
