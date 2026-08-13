import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const jobStatuses = [
    "Programmato",
    "In corso",
    "Completato",
    "Da completare",
    "Rimandato",
    "Annullato",
    "Sospeso per pioggia",
  ];

  const workTypes = [
    "Manutenzione ordinaria giardino",
    "Taglio erba",
    "Potatura",
    "Taglio siepi",
    "Pulizia area verde",
    "Controllo irrigazione",
    "Trattamento prato",
    "Altro",
  ];

  const equipment = [
    "Furgone",
    "Tagliaerba",
    "Decespugliatore",
    "Soffiatore",
    "Tagliasiepi",
    "Motosega",
    "Scala",
    "Kit irrigazione",
  ];

  for (const name of jobStatuses) {
    await prisma.jobStatus.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const name of workTypes) {
    await prisma.workType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const name of equipment) {
    await prisma.equipment.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const adminUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.warn(
      "Admin user was not created because ADMIN_USERNAME or ADMIN_PASSWORD is missing."
    );
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.user.upsert({
      where: {
        username: adminUsername,
      },
      create: {
        username: adminUsername,
        passwordHash,
        role: "ADMIN",
      },
      update: { passwordHash, role: "ADMIN" },
    });

    console.log(`Admin user '${adminUsername}' created or updated successfully.`);
  }

  const demoUsername = process.env.DEMO_USERNAME?.trim().toLowerCase();
  const demoPassword = process.env.DEMO_PASSWORD;

  if (!demoUsername || !demoPassword) {
    console.warn("Demo user was not created because DEMO_USERNAME or DEMO_PASSWORD is missing.");
  } else if (demoUsername === adminUsername) {
    throw new Error("DEMO_USERNAME must be different from ADMIN_USERNAME.");
  } else {
    const passwordHash = await bcrypt.hash(demoPassword, 12);
    await prisma.user.upsert({
      where: { username: demoUsername },
      update: { passwordHash, role: "DEMO" },
      create: { username: demoUsername, passwordHash, role: "DEMO" },
    });
    console.log(`Demo user '${demoUsername}' created or updated successfully.`);
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
