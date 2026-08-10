import schedule from "node-schedule";
import prisma from "../src/lib/db";
import { processBirthdaySMS } from "./actions/birthday-sms";

// Keep track of active jobs in memory
const activeJobs: Record<number, schedule.Job> = {};

export async function syncJobs() {
  try {
    const dbJobs = await prisma.cronJob.findMany({
      where: { is_active: true }
    });

    const activeDbJobIds = dbJobs.map(job => job.id);

    // Cancel and remove jobs that are no longer active or have been deleted
    for (const [jobId, job] of Object.entries<schedule.Job>(activeJobs)) {
      if (!activeDbJobIds.includes(Number(jobId))) {
        job.cancel();
        delete activeJobs[Number(jobId)];
        console.log(`[Worker] Cancelled job ID ${jobId}`);
      }
    }

    // Schedule or reschedule jobs
    for (const dbJob of dbJobs) {
      const existingJob = activeJobs[dbJob.id];
      
      // If the job already exists, check if its schedule changed.
      // (node-schedule doesn't store the raw string nicely, so it's easier to just recreate it
      // or assume we need to sync it. For simplicity, let's just recreate it if it exists
      // to ensure the schedule string matches DB).
      if (existingJob) {
        existingJob.cancel();
      }

      activeJobs[dbJob.id] = schedule.scheduleJob(dbJob.schedule, async () => {
        console.log(`[Worker] Executing job: ${dbJob.name} (${dbJob.action_type})`);
        
        switch (dbJob.action_type) {
          case "BIRTHDAY_SMS":
            await processBirthdaySMS(dbJob.id, dbJob.metadata);
            break;
          default:
            console.log(`[Worker] Unknown action_type: ${dbJob.action_type}`);
        }
      });
      // Comment out verbose logging for every sync to avoid spamming the console
      // console.log(`[Worker] Synced job ID ${dbJob.id} -> ${dbJob.schedule}`);
    }

  } catch (error) {
    console.error("[Worker] Error syncing jobs:", error);
  }
}
