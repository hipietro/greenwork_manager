import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/work-types
 * Returns all work types.
 */
router.get("/", async (_req, res) => {
  try {
    const workTypes = await prisma.workType.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json(workTypes);
  } catch (error) {
    console.error("Error fetching work types:", error);
    res.status(500).json({ message: "Errore durante il recupero dei tipi di intervento." });
  }
});

/**
 * POST /api/work-types
 * Creates a new work type.
 */
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ message: "Il nome del tipo di intervento è obbligatorio." });
    }

    const workType = await prisma.workType.create({
      data: {
        name: name.trim(),
      },
    });

    res.status(201).json(workType);
  } catch (error: any) {
    console.error("Error creating work type:", error);

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Esiste già un tipo di intervento con questo nome." });
    }

    res.status(500).json({ message: "Errore durante la creazione del tipo di intervento." });
  }
});

/**
 * PUT /api/work-types/:id
 * Updates a work type.
 */
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, isActive } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID tipo di intervento non valido." });
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ message: "Il nome del tipo di intervento è obbligatorio." });
    }

    const workType = await prisma.workType.update({
      where: { id },
      data: {
        name: name.trim(),
        isActive: typeof isActive === "boolean" ? isActive : undefined,
      },
    });

    res.json(workType);
  } catch (error: any) {
    console.error("Error updating work type:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Tipo di intervento non trovato." });
    }

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Esiste già un tipo di intervento con questo nome." });
    }

    res.status(500).json({ message: "Errore durante la modifica del tipo di intervento." });
  }
});

/**
 * PATCH /api/work-types/:id/deactivate
 * Deactivates a work type without deleting it.
 */
router.patch("/:id/deactivate", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID tipo di intervento non valido." });
    }

    const workType = await prisma.workType.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    res.json(workType);
  } catch (error: any) {
    console.error("Error deactivating work type:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Tipo di intervento non trovato." });
    }

    res.status(500).json({ message: "Errore durante la disattivazione del tipo di intervento." });
  }
});
/**
 * PATCH /api/work-types/:id/activate
 * Reactivates a work type.
 */
router.patch("/:id/activate", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID tipo di intervento non valido." });
    }

    const workType = await prisma.workType.update({
      where: { id },
      data: {
        isActive: true,
      },
    });

    res.json(workType);
  } catch (error: any) {
    console.error("Error activating work type:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Tipo di intervento non trovato." });
    }

    res.status(500).json({ message: "Errore durante la riattivazione del tipo di intervento." });
  }
});
/**
 * DELETE /api/work-types/:id
 * Deletes a work type only if it is not used in any job.
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID tipo di intervento non valido." });
    }

    const usageCount = await prisma.job.count({
      where: {
        workTypeId: id,
      },
    });

    if (usageCount > 0) {
      return res.status(409).json({
        message:
          "Questo tipo di intervento è già collegato a uno o più cantieri. Puoi disattivarlo, ma non eliminarlo.",
      });
    }

    await prisma.workType.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting work type:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Tipo di intervento non trovato." });
    }

    res.status(500).json({ message: "Errore durante l'eliminazione del tipo di intervento." });
  }
});

export default router;