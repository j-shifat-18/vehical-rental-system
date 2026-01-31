import { pool } from "../../config/db"

const getAllUsers = async(payload : Record<string , unknown>)=>{
    const result = await pool.query(`SELECT * FROM USERS`);

    return result.rows;
}

const deleteUser = async(id : string)=>{
    const result = await pool.query(`DELETE FROM USERS WHERE ID = $1` , [id]);

    return result;
}

export const userServices = {
    getAllUsers,
    deleteUser
}