import { Pool } from "pg";
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,        // ==> đổi sang host Neon
  database: process.env.DB_NAME,    // ==> đổi sang tên DB Neon
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  ssl: { rejectUnauthorized: true }, // hoặc thêm ?sslmode=require trong URL
});
export default pool;
