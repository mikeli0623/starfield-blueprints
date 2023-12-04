const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

app.use(
  cors({
    credentials: true,
    origin: /^http:\/\/localhost:\d+$/,
  })
);
app.use(cookieParser());
app.use(express.json());
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

const userRoute = require("./routes/users");
app.use("/api/users", userRoute);

const postRoute = require("./routes/posts");
app.use("/api/posts", postRoute);

const authRoute = require("./routes/auth");
app.use("/api/auth", authRoute);

const imageRoute = require("./routes/images");
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
