import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { env } from "./config/env";
import { corsOptions } from "./config/security";
import { requireAuth } from "./middleware/requireAuth";
import authRoutes from "./routes/auth.routes";
import equipmentRoutes from "./routes/equipment.routes";
import workTypeRoutes from "./routes/workType.routes";
import jobStatusRoutes from "./routes/jobStatus.routes";
import employeeRoutes from "./routes/employee.routes";
import jobRoutes from "./routes/job.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import attendanceRoutes from "./routes/attendance.routes";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));

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

if (env.nodeEnv === "production") {
  const frontendDistPath = path.join(__dirname, "../../frontend/dist");

  app.use(express.static(frontendDistPath));

  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});