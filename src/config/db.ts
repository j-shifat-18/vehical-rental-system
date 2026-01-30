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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS VEHICLES (
        ID SERIAL PRIMARY KEY,
        VEHICLE_NAME VARCHAR(200) NOT NULL,
        TYPE VARCHAR(20) NOT NULL 
            CHECK (TYPE IN ('car', 'bike', 'van', 'SUV')),
        REGISTRATION_NUMBER VARCHAR(100) UNIQUE NOT NULL,
        DAILY_RENT_PRICE NUMERIC(10, 2) NOT NULL 
            CHECK (DAILY_RENT_PRICE > 0),
        AVAILABILITY_STATUS VARCHAR(20) NOT NULL 
            CHECK (AVAILABILITY_STATUS IN ('available', 'booked'))
    )`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS BOOKINGS (
        ID SERIAL PRIMARY KEY,
        CUSTOMER_ID INT NOT NULL,
        VEHICLE_ID INT NOT NULL,
        RENT_START_DATE DATE NOT NULL,
        RENT_END_DATE DATE NOT NULL
            CHECK (RENT_END_DATE > RENT_START_DATE),
        TOTAL_PRICE NUMERIC(10, 2) NOT NULL
            CHECK (TOTAL_PRICE > 0),
        STATUS VARCHAR(20) NOT NULL
            CHECK (STATUS IN ('active', 'cancelled', 'returned')),

        CONSTRAINT FK_BOOKINGS_CUSTOMER
            FOREIGN KEY (CUSTOMER_ID)
            REFERENCES USERS(ID)
            ON DELETE CASCADE,

        CONSTRAINT FK_BOOKINGS_VEHICLE
            FOREIGN KEY (VEHICLE_ID)
            REFERENCES VEHICLES(ID)
            ON DELETE CASCADE
    )`);
};

export default initDB;
