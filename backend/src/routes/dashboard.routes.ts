import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/dashboard/daily?date=YYYY-MM-DD
 * Returns daily dashboard data for the selected date.
 */
router.get("/daily", async (req, res) => {
  try {
    const selectedDate =
      typeof req.query.date === "string"
        ? req.query.date
        : new Date().toISOString().slice(0, 10);

    const start = new Date(`${selectedDate}T00:00:00.000Z`);
    const end = new Date(`${selectedDate}T23:59:59.999Z`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: "Data dashboard non valida." });
    }

    const jobs = await prisma.job.findMany({
      where: {
      OR: [
        {
          scheduledEndDate: null,
          scheduledDate: {
            gte: start,
            lte: end,
          },
        },
        {
          scheduledDate: {
            lte: end,
          },
          scheduledEndDate: {
            gte: start,
          },
        },
      ],
    },
      orderBy: [
        {
          scheduledStartTime: "asc",
        },
        {
          title: "asc",
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

    const statusSummary = jobs.reduce<Record<string, number>>((summary, job) => {
      const statusName = job.jobStatus?.name || "Senza stato";

      summary[statusName] = (summary[statusName] || 0) + 1;

      return summary;
    }, {});

    const jobsWithoutEquipment = jobs.filter(
      (job) => job.equipment.length === 0
    ).length;

    res.json({
      date: selectedDate,
      totalJobs: jobs.length,
      statusSummary,
      jobsWithoutEquipment,
      jobs,
    });
  } catch (error) {
    console.error("Error fetching daily dashboard:", error);
    res.status(500).json({
      message: "Errore durante il recupero dei dati della dashboard.",
    });
  }
});

export default router;