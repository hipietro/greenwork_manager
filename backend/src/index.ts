import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import equipmentRoutes from "./routes/equipment.routes";
import workTypeRoutes from "./routes/workType.routes";
import jobStatusRoutes from "./routes/jobStatus.routes";
import employeeRoutes from "./routes/employee.routes";
import jobRoutes from "./routes/job.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import attendanceRoutes from "./routes/attendance.routes";
import { requireAuth } from "./middleware/requireAuth";

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

app.use("/api/auth", authRoutes);

app.use("/api/equipment", requireAuth, equipmentRoutes);
app.use("/api/work-types", requireAuth, workTypeRoutes);
app.use("/api/job-statuses", requireAuth, jobStatusRoutes);
app.use("/api/employees", requireAuth, employeeRoutes);
app.use("/api/jobs", requireAuth, jobRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/attendance", requireAuth, attendanceRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});