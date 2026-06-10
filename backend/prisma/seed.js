"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
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
            yield prisma.jobStatus.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        }
        for (const name of workTypes) {
            yield prisma.workType.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        }
        for (const name of equipment) {
            yield prisma.equipment.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        }
        console.log("Seed completed successfully.");
    });
}
main()
    .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
