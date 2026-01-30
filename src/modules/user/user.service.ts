import { pool } from "../../config/db"

const getAllUsers = async(payload : Record<string , unknown>)=>{
    const result = await pool.query(`SELECT * FROM USERS`);

    return result.rows;
}

export const userServices = {
    getAllUsers,
}