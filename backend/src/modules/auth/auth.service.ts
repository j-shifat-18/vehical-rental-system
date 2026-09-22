import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import jwt from "jsonwebtoken";
import config from "../../config";

const signup = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  const hashedPassword = await bcrypt.hash(password as string, 10);

  const result = await pool.query(
    `INSERT INTO USERS (NAME , EMAIL , PASSWORD , PHONE, ROLE) VALUES ($1 , $2 , $3 , $4 , $5) RETURNING ID, NAME, EMAIL, PHONE, ROLE`,
    [name, email, hashedPassword, phone, role],
  );

  return result.rows[0];
};

const signin = async (payload: Record<string, unknown>) => {
  const { email, password } = payload;

  const result = await pool.query(`SELECT * FROM USERS WHERE email = $1`, [
    email,
  ]);

  if (result.rows.length == 0) {
    return null;
  }

  const user = result.rows[0];

  const matchPass = await bcrypt.compare(password as string, user.password);

  if (!matchPass) {
    return false;
  }

  const token = jwt.sign(
    { id : user.id , name: user.name, email: user.email, role: user.role },
    config.jwtSecret as string,
    {
      expiresIn: "7d",
    },
  );

  // Return user data without password
  const { password: _, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword
  };
};

export const authServices = {
  signup,
  signin
};
