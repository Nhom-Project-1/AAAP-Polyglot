import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

pool.connect()
  .then(() => console.log("PostgreSQL kết nối thành công "))
  .catch((err) => console.error("PostgreSQL kết nối không thành công:", err));

export default pool;
