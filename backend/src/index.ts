import express from "express";
import dotenv from "dotenv";
// Load environment variables before importing db
dotenv.config();

import { authRouter } from "./routers/auth_router";
import { blogRouter } from "./routers/blog_router";

const app = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api", blogRouter);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
