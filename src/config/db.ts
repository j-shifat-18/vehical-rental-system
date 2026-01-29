import { Pool } from "pg";
import config from ".";

//DB
export const pool = new Pool({
  connectionString: `${config.connection_str}`,
});

const initDB = async () => {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS USERS(
            ID SERIAL PRIMARY KEY ,
            NAME VARCHAR(200) NOT NULL ,
            EMAIL VARCHAR(100) UNIQUE NOT NULL CHECK (EMAIL = LOWER(EMAIL)),
            PASSWORD VARCHAR(200) NOT NULL CHECK (LENGTH(PASSWORD) >= 6),
            PHONE VARCHAR(15) NOT NULL , 
            ROLE VARCHAR(20) CHECK(ROLE in ('admin' , 'customer')) 
        )`);
  
};

export default initDB;