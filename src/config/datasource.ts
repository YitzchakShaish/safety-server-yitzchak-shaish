import "reflect-metadata";
import path from "path";
import "dotenv/config";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.SAFETY_DEMO === "true" ? "src/db/demo.sqlite" : "src/db/database.sqlite",
  entities: [path.join(__dirname, "../entities/*.{ts,js}")],
  migrations: [path.join(__dirname, "../migrations/*.{ts,js}")],
  synchronize: true,
});
