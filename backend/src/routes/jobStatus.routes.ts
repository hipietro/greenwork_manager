import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/job-statuses
 * Returns all job statuses.
 */
router.get("/", async (_req, res) => {
  try {
    const jobStatuses = await prisma.jobStatus.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json(jobStatuses);
  } catch (error) {
    console.error("Error fetching job statuses:", error);
    res.status(500).json({ message: "Errore durante il recupero degli stati cantiere." });
  }
});

/**
 * POST /api/job-statuses
 * Creates a new job status.
 */
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ message: "Il nome dello stato cantiere è obbligatorio." });
    }

    const jobStatus = await prisma.jobStatus.create({
      data: {
        name: name.trim(),
      },
    });

    res.status(201).json(jobStatus);
  } catch (error: any) {
    console.error("Error creating job status:", error);

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Esiste già uno stato cantiere con questo nome." });
    }

    res.status(500).json({ message: "Errore durante la creazione dello stato cantiere." });
  }
});

/**
 * PUT /api/job-statuses/:id
 * Updates a job status.
 */
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, isActive } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID stato cantiere non valido." });
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ message: "Il nome dello stato cantiere è obbligatorio." });
    }

    const jobStatus = await prisma.jobStatus.update({
      where: { id },
      data: {
        name: name.trim(),
        isActive: typeof isActive === "boolean" ? isActive : undefined,
      },
    });

    res.json(jobStatus);
  } catch (error: any) {
    console.error("Error updating job status:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Stato cantiere non trovato." });
    }

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Esiste già uno stato cantiere con questo nome." });
    }

    res.status(500).json({ message: "Errore durante la modifica dello stato cantiere." });
  }
});

/**
 * PATCH /api/job-statuses/:id/deactivate
 * Deactivates a job status without deleting it.
 */
router.patch("/:id/deactivate", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID stato cantiere non valido." });
    }

    const jobStatus = await prisma.jobStatus.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    res.json(jobStatus);
  } catch (error: any) {
    console.error("Error deactivating job status:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Stato cantiere non trovato." });
    }

    res.status(500).json({ message: "Errore durante la disattivazione dello stato cantiere." });
  }
});

/**
 * DELETE /api/job-statuses/:id
 * Deletes a job status only if it is not used in any job.
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID stato cantiere non valido." });
    }

    const usageCount = await prisma.job.count({
      where: {
        jobStatusId: id,
      },
    });

    if (usageCount > 0) {
      return res.status(409).json({
        message:
          "Questo stato cantiere è già collegato a uno o più cantieri. Puoi disattivarlo, ma non eliminarlo.",
      });
    }

    await prisma.jobStatus.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting job status:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Stato cantiere non trovato." });
    }

    res.status(500).json({ message: "Errore durante l'eliminazione dello stato cantiere." });
  }
});

export default router;