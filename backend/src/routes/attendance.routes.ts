import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/attendance?date=YYYY-MM-DD
 * Returns attendance records for a specific day.
 */
router.get("/", async (req, res) => {
  try {
    const date =
      typeof req.query.date === "string"
        ? req.query.date
        : new Date().toISOString().slice(0, 10);

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const records = await prisma.attendanceRecord.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        employee: {
          fullName: "asc",
        },
      },
      include: {
        employee: true,
      },
    });

    res.json(records);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ message: "Errore durante il recupero delle presenze." });
  }
});

/**
 * POST /api/attendance
 * Creates or updates a daily attendance record for an employee.
 */
router.post("/", async (req, res) => {
  try {
    const { employeeId, date, isPresent, checkInTime, checkOutTime, notes } = req.body;

    if (typeof employeeId !== "number") {
      return res.status(400).json({ message: "Dipendente non valido." });
    }

    if (!date || typeof date !== "string") {
      return res.status(400).json({ message: "Data presenza obbligatoria." });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Data presenza non valida." });
    }

    const record = await prisma.attendanceRecord.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: parsedDate,
        },
      },
      update: {
        isPresent: typeof isPresent === "boolean" ? isPresent : true,
        checkInTime: checkInTime?.trim() || null,
        checkOutTime: checkOutTime?.trim() || null,
        notes: notes?.trim() || null,
      },
      create: {
        employeeId,
        date: parsedDate,
        isPresent: typeof isPresent === "boolean" ? isPresent : true,
        checkInTime: checkInTime?.trim() || null,
        checkOutTime: checkOutTime?.trim() || null,
        notes: notes?.trim() || null,
      },
      include: {
        employee: true,
      },
    });

    res.json(record);
  } catch (error: any) {
    console.error("Error saving attendance record:", error);

    if (error.code === "P2003") {
      return res.status(400).json({ message: "Dipendente non trovato." });
    }

    res.status(500).json({ message: "Errore durante il salvataggio della presenza." });
  }
});

/**
 * DELETE /api/attendance/:id
 * Deletes an attendance record.
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID presenza non valido." });
    }

    await prisma.attendanceRecord.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting attendance record:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Presenza non trovata." });
    }

    res.status(500).json({ message: "Errore durante l'eliminazione della presenza." });
  }
});

export default router;