import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";

export const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());

// health check route
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running ✅" });
});

app.use("/api", routes);