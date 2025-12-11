import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/datasource";
import { config } from "./config"
import authRouter from "./routes/auth.router"
import userRouter from "./routes/user.router"
import eventRouter from "./routes/eventReport.router"
import cookieParser from "cookie-parser";
import reportImagesRoutes from "./routes/reportImages.routes";
import overviewRoutes from "./routes/overview.routes";

const app: express.Application = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(cookieParser());
app.use("/uploads", express.static("public/uploads"));
app.use("/images", express.static("public/images"));
app.use(express.json());
app.use('/auth', authRouter);
app.use('/', eventRouter);
app.use('/reports', reportImagesRoutes);
app.use('/users', userRouter);
app.use('/', overviewRoutes);

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
