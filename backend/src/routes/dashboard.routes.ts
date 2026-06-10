import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/dashboard/daily?date=YYYY-MM-DD
 * Returns a daily operational summary.
 */
router.get("/daily", async (req, res) => {
  try {
    const date =
      typeof req.query.date === "string"
        ? req.query.date
        : new Date().toISOString().slice(0, 10);

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const jobs = await prisma.job.findMany({
      where: {
        scheduledDate: {
          gte: start,
          lte: end,
        },
      },
      orderBy: [
        {
          scheduledDate: "asc",
        },
        {
          scheduledStartTime: "asc",
        },
      ],
      include: {
        workType: true,
        jobStatus: true,
        equipment: {
          include: {
            equipment: true,
          },
        },
      },
    });

    const statusSummary = jobs.reduce<Record<string, number>>((acc, job) => {
      const statusName = job.jobStatus?.name || "Senza stato";
      acc[statusName] = (acc[statusName] || 0) + 1;
      return acc;
    }, {});

    const jobsWithoutEquipment = jobs.filter((job) => job.equipment.length === 0);

    res.json({
      date,
      totalJobs: jobs.length,
      statusSummary,
      jobsWithoutEquipment: jobsWithoutEquipment.length,
      jobs,
    });
  } catch (error) {
    console.error("Error fetching daily dashboard:", error);
    res.status(500).json({ message: "Errore durante il recupero della dashboard giornaliera." });
  }
});

export default router;