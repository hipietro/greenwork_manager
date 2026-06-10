import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/equipment
 * Returns all equipment items.
 */
router.get("/", async (_req, res) => {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({ message: "Errore durante il recupero delle attrezzature." });
  }
});

/**
 * POST /api/equipment
 * Creates a new equipment item.
 */
router.post("/", async (req, res) => {
  try {
    const { name, notes } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ message: "Il nome dell'attrezzatura è obbligatorio." });
    }

    const equipment = await prisma.equipment.create({
      data: {
        name: name.trim(),
        notes: notes?.trim() || null,
      },
    });

    res.status(201).json(equipment);
  } catch (error: any) {
    console.error("Error creating equipment:", error);

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Esiste già un'attrezzatura con questo nome." });
    }

    res.status(500).json({ message: "Errore durante la creazione dell'attrezzatura." });
  }
});

/**
 * PUT /api/equipment/:id
 * Updates an equipment item.
 */
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, notes, isActive } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID attrezzatura non valido." });
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ message: "Il nome dell'attrezzatura è obbligatorio." });
    }

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        name: name.trim(),
        notes: notes?.trim() || null,
        isActive: typeof isActive === "boolean" ? isActive : undefined,
      },
    });

    res.json(equipment);
  } catch (error: any) {
    console.error("Error updating equipment:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Attrezzatura non trovata." });
    }

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Esiste già un'attrezzatura con questo nome." });
    }

    res.status(500).json({ message: "Errore durante la modifica dell'attrezzatura." });
  }
});

/**
 * PATCH /api/equipment/:id/deactivate
 * Deactivates an equipment item without deleting it.
 */
router.patch("/:id/deactivate", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID attrezzatura non valido." });
    }

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    res.json(equipment);
  } catch (error: any) {
    console.error("Error deactivating equipment:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Attrezzatura non trovata." });
    }

    res.status(500).json({ message: "Errore durante la disattivazione dell'attrezzatura." });
  }
});
/**
 * PATCH /api/equipment/:id/activate
 * Reactivates an equipment item.
 */
router.patch("/:id/activate", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID attrezzatura non valido." });
    }

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        isActive: true,
      },
    });

    res.json(equipment);
  } catch (error: any) {
    console.error("Error activating equipment:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Attrezzatura non trovata." });
    }

    res.status(500).json({ message: "Errore durante la riattivazione dell'attrezzatura." });
  }
});

/**
 * DELETE /api/equipment/:id
 * Deletes an equipment item only if it is not used in any job.
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID attrezzatura non valido." });
    }

    const usageCount = await prisma.jobEquipment.count({
      where: {
        equipmentId: id,
      },
    });

    if (usageCount > 0) {
      return res.status(409).json({
        message:
          "Questa attrezzatura è già collegata a uno o più cantieri. Puoi disattivarla, ma non eliminarla.",
      });
    }

    await prisma.equipment.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting equipment:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Attrezzatura non trovata." });
    }

    res.status(500).json({ message: "Errore durante l'eliminazione dell'attrezzatura." });
  }
});


export default router;