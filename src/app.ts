import "reflect-metadata";
import express from "express";
import cors from "cors"; 
import { AppDataSource } from "./config/datasource";
import { config } from "./config"
import authRouter from "./routes/auth.router"


const app: express.Application = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);
app.use((_req, res) => {
  res.status(404).json({ message: "הנתיב הזה לא קיים במערכת" });
});




AppDataSource.initialize()
  .then(() => {
    console.log("Data Source initialized");
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  })
  .catch((err) => console.error(err));
