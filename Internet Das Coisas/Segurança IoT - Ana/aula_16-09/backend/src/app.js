import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { db } from "./config/database.js";
import authRouter from "./routers/auth.js";
import materialsRouter from "./routers/materials.js";

dotenv.config();

const app = express();

app.locals.db = db;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));

app.use(express.json());

app.use(express.static(fileURLToPath(new URL("../public", import.meta.url))));

app.use("/api", authRouter);
app.use("/api/materials", materialsRouter);

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "JSON invalido." });
  }

  console.error(err.message);
  res.status(500).json({ message: "Erro interno. Verifique o servidor e o banco." });
});

export default app;
