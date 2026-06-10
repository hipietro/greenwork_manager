import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/employees
 * Returns all employees.
 */
router.get("/", async (_req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: {
        fullName: "asc",
      },
    });

    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Errore durante il recupero dei dipendenti." });
  }
});

/**
 * GET /api/employees/:id
 * Returns a single employee.
 */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID dipendente non valido." });
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return res.status(404).json({ message: "Dipendente non trovato." });
    }

    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: "Errore durante il recupero del dipendente." });
  }
});

/**
 * POST /api/employees
 * Creates a new employee.
 */
router.post("/", async (req, res) => {
  try {
    const { fullName, phone, notes } = req.body;

    if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
      return res.status(400).json({ message: "Il nome del dipendente è obbligatorio." });
    }

    const employee = await prisma.employee.create({
      data: {
        fullName: fullName.trim(),
        phone: phone?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Errore durante la creazione del dipendente." });
  }
});

/**
 * PUT /api/employees/:id
 * Updates an employee.
 */
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { fullName, phone, notes, isActive } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID dipendente non valido." });
    }

    if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
      return res.status(400).json({ message: "Il nome del dipendente è obbligatorio." });
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        fullName: fullName.trim(),
        phone: phone?.trim() || null,
        notes: notes?.trim() || null,
        isActive: typeof isActive === "boolean" ? isActive : undefined,
      },
    });

    res.json(employee);
  } catch (error: any) {
    console.error("Error updating employee:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Dipendente non trovato." });
    }

    res.status(500).json({ message: "Errore durante la modifica del dipendente." });
  }
});

/**
 * PATCH /api/employees/:id/deactivate
 * Deactivates an employee without deleting it.
 */
router.patch("/:id/deactivate", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID dipendente non valido." });
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    res.json(employee);
  } catch (error: any) {
    console.error("Error deactivating employee:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Dipendente non trovato." });
    }

    res.status(500).json({ message: "Errore durante la disattivazione del dipendente." });
  }
});
/**
 * PATCH /api/employees/:id/activate
 * Reactivates an employee.
 */
router.patch("/:id/activate", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID dipendente non valido." });
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        isActive: true,
      },
    });

    res.json(employee);
  } catch (error: any) {
    console.error("Error activating employee:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Dipendente non trovato." });
    }

    res.status(500).json({ message: "Errore durante la riattivazione del dipendente." });
  }
});
/**
 * DELETE /api/employees/:id
 * Deletes an employee.
 *
 * At the moment employees are not linked to jobs,
 * so deletion is allowed.
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID dipendente non valido." });
    }

    await prisma.employee.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting employee:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Dipendente non trovato." });
    }

    res.status(500).json({ message: "Errore durante l'eliminazione del dipendente." });
  }
});

export default router;