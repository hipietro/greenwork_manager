import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "greenwork_manager_api",
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});