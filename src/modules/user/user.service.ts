import { pool } from "../../config/db"

const getAllUsers = async(payload : Record<string , unknown>)=>{
    const result = await pool.query(`SELECT * FROM USERS`);

    return result;
}

export const userServices = {
    getAllUsers,
}