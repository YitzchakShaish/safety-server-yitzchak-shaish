import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./config/datasource";
import { config } from "./config"


const app: express.Application = express();


app.use(express.json());



AppDataSource.initialize()
  .then(() => {
    console.log("Data Source initialized");
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  })
  .catch((err) => console.error(err));