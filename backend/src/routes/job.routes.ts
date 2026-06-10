import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/jobs
 * Returns all jobs.
 * Optional query params:
 * - date=YYYY-MM-DD
 * - statusId=number
 */
router.get("/", async (req, res) => {
  try {
    const { date, statusId } = req.query;

    const where: any = {};

    if (typeof date === "string") {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);

      where.scheduledDate = {
        gte: start,
        lte: end,
      };
    }

    if (typeof statusId === "string" && !Number.isNaN(Number(statusId))) {
      where.jobStatusId = Number(statusId);
    }

    const jobs = await prisma.job.findMany({
      where,
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

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Errore durante il recupero dei cantieri." });
  }
});

/**
 * GET /api/jobs/:id
 * Returns a single job.
 */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID cantiere non valido." });
    }

    const job = await prisma.job.findUnique({
      where: { id },
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

    if (!job) {
      return res.status(404).json({ message: "Cantiere non trovato." });
    }

    res.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Errore durante il recupero del cantiere." });
  }
});

/**
 * POST /api/jobs
 * Creates a new job.
 */
router.post("/", async (req, res) => {
  try {
    const {
      title,
      customerName,
      address,
      scheduledDate,
      scheduledStartTime,
      scheduledEndTime,
      workTypeId,
      jobStatusId,
      equipmentIds,
      operationalNotes,
      finalNotes,
    } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ message: "Il titolo del cantiere è obbligatorio." });
    }

    if (!scheduledDate || typeof scheduledDate !== "string") {
      return res.status(400).json({ message: "La data del cantiere è obbligatoria." });
    }

    const parsedDate = new Date(scheduledDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Data cantiere non valida." });
    }

    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        customerName: customerName?.trim() || null,
        address: address?.trim() || null,
        scheduledDate: parsedDate,
        scheduledStartTime: scheduledStartTime?.trim() || null,
        scheduledEndTime: scheduledEndTime?.trim() || null,
        workTypeId: typeof workTypeId === "number" ? workTypeId : null,
        jobStatusId: typeof jobStatusId === "number" ? jobStatusId : null,
        operationalNotes: operationalNotes?.trim() || null,
        finalNotes: finalNotes?.trim() || null,
        equipment: Array.isArray(equipmentIds)
          ? {
              create: equipmentIds.map((equipmentId: number) => ({
                equipmentId,
              })),
            }
          : undefined,
      },
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

    res.status(201).json(job);
  } catch (error: any) {
    console.error("Error creating job:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Uno dei riferimenti selezionati non è valido.",
      });
    }

    res.status(500).json({ message: "Errore durante la creazione del cantiere." });
  }
});

/**
 * PUT /api/jobs/:id
 * Updates a job and replaces its equipment list.
 */
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID cantiere non valido." });
    }

    const {
      title,
      customerName,
      address,
      scheduledDate,
      scheduledStartTime,
      scheduledEndTime,
      workTypeId,
      jobStatusId,
      equipmentIds,
      operationalNotes,
      finalNotes,
    } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ message: "Il titolo del cantiere è obbligatorio." });
    }

    if (!scheduledDate || typeof scheduledDate !== "string") {
      return res.status(400).json({ message: "La data del cantiere è obbligatoria." });
    }

    const parsedDate = new Date(scheduledDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Data cantiere non valida." });
    }

    const job = await prisma.$transaction(async (tx) => {
      await tx.jobEquipment.deleteMany({
        where: {
          jobId: id,
        },
      });

      return tx.job.update({
        where: { id },
        data: {
          title: title.trim(),
          customerName: customerName?.trim() || null,
          address: address?.trim() || null,
          scheduledDate: parsedDate,
          scheduledStartTime: scheduledStartTime?.trim() || null,
          scheduledEndTime: scheduledEndTime?.trim() || null,
          workTypeId: typeof workTypeId === "number" ? workTypeId : null,
          jobStatusId: typeof jobStatusId === "number" ? jobStatusId : null,
          operationalNotes: operationalNotes?.trim() || null,
          finalNotes: finalNotes?.trim() || null,
          equipment: Array.isArray(equipmentIds)
            ? {
                create: equipmentIds.map((equipmentId: number) => ({
                  equipmentId,
                })),
              }
            : undefined,
        },
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
    });

    res.json(job);
  } catch (error: any) {
    console.error("Error updating job:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Cantiere non trovato." });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Uno dei riferimenti selezionati non è valido.",
      });
    }

    res.status(500).json({ message: "Errore durante la modifica del cantiere." });
  }
});

/**
 * DELETE /api/jobs/:id
 * Deletes a job.
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID cantiere non valido." });
    }

    await prisma.job.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting job:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Cantiere non trovato." });
    }

    res.status(500).json({ message: "Errore durante l'eliminazione del cantiere." });
  }
});

export default router;