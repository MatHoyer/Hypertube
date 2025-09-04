import { newUTCDate } from "@hypertube/libs";
import { subMonths } from "date-fns";
import cron from "node-cron";
import prisma from "../src/lib/prisma";

console.log("Cron jobs started");

cron.schedule("0 0 * * *", async () => {
  console.log("Deleting movies older than 1 month");

  await prisma.movie.deleteMany({
    where: {
      usedAt: {
        lt: subMonths(newUTCDate(), 1),
      },
    },
  });
});
