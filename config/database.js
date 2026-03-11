import pgPromise from "pg-promise";
import dotenv from "dotenv";

dotenv.config();

const pgp = pgPromise();

const db = pgp({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
// AÑADIR LA CONEXIÓN DEL SERVIDOR DE BASE DE DATOS.

export default db;