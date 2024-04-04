import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";

import userRoute from "./routes/users.js";
import postRoute from "./routes/posts.js";
import authRoute from "./routes/auth.js";
import imageRoute from "./routes/images.js";

dotenv.config();
const app = express();

app.use(
  cors({
    credentials: true,
    origin: "https://starfieldblueprints.com",
  })
);
app.use(cookieParser());
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/api", express.static(path.join(__dirname, "api")));

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from DB");
});

mongoose.connection.on("connected", () => {
  console.log("Connected to DB");
});

const connect = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
  } catch (error) {
    throw error;
  }
};

app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/auth", authRoute);
app.use("/api/images", imageRoute);

app.use((err, req, res, next) => {
  const errStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

app.listen(8080, () => {
  console.log("Server running");
  connect();
});
