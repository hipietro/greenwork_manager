import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import equipmentRoutes from "./routes/equipment.routes";
import workTypeRoutes from "./routes/workType.routes";
import jobStatusRoutes from "./routes/jobStatus.routes";

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

app.use("/api/equipment", equipmentRoutes);
app.use("/api/work-types", workTypeRoutes);
app.use("/api/job-statuses", jobStatusRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});