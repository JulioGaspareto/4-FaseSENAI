import pg from "pg";
import dotenv from "dotenv";

dotenv.config();


export const db = new pg.Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "faxina_db",
    max: 10
});

db.on("error", error => {
    console.error("Erro numa conexao ociosa do banco:", error.message);
});