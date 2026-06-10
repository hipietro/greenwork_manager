import { PrismaClient } from "@prisma/client";

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