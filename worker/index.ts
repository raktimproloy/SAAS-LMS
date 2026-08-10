import "dotenv/config";
import { syncJobs } from "./scheduler";
import prisma from "../src/lib/db";
import schedule from "node-schedule";

async function bootstrap() {
  console.log("[Worker] Starting Custom Cron Job Worker...");
  console.log("[Worker] API_KEY CHECK:", process.env.BULKSMS_API_KEY ? "EXISTS" : "MISSING");
  console.log("[Worker] SENDER_ID CHECK:", process.env.BULKSMS_SENDER_ID ? "EXISTS" : "MISSING");
  
  // Ensure the default Birthday SMS job exists in the DB so it shows up in UI
  const existingBirthdayJob = await prisma.cronJob.findFirst({
    where: { action_type: "BIRTHDAY_SMS" }
  });

  if (!existingBirthdayJob) {
    console.log("[Worker] Creating default Birthday SMS cron job entry in DB...");
    await prisma.cronJob.create({
      data: {
        name: "Daily Birthday Wish",
        description: "Sends automated birthday wishes to students on their birthdays.",
        schedule: "0 10 * * *", // Default 10:00 AM daily
        action_type: "BIRTHDAY_SMS",
        is_active: false, // Default false until they enable it from UI
        metadata: JSON.stringify({ template: "Happy Birthday! Wishing you a day filled with happiness and a year filled with joy. - Doctor Biology" })
      }
    });
  }

  // Initial Sync
  await syncJobs();

  // Run Master Sync Loop every minute
  // This ensures if a schedule changes in DB, the node-schedule updates within a minute
  schedule.scheduleJob("* * * * *", async () => {
    await syncJobs();
  });

  console.log("[Worker] Worker initialized and watching for DB changes...");
}

bootstrap().catch(console.error);
