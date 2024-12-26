import express from "express";
import cors from "cors";
import { mainRouter } from "./router/v1/mainRouter";
import { userRouter } from "./router/v1/userRouter";
import { spaceRouter } from "./router/v1/spaceRouter";
import { adminRouter } from "./router/v1/adminRouter";

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Configure CORS
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies or authentication headers
  })
);
app.use(express.json());
const PORT = 3000;

app.use("/api/v1", mainRouter);
app.use("/api/v1/user/metadata", userRouter);
app.use("/api/v1/space", spaceRouter);
app.use("/api/v1/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("Hello from CodeClub");
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
