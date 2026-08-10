import prisma from "../../src/lib/db";
import { sendSMS } from "../../src/lib/sms";

export async function processBirthdaySMS(jobId: number, metadata: string | null) {
  try {
    const defaultTemplate = "Happy Birthday! Wishing you a day filled with happiness and a year filled with joy. - Doctor Biology";
    let template = defaultTemplate;

    if (metadata) {
      try {
        const parsed = JSON.parse(metadata);
        if (parsed.template) template = parsed.template;
      } catch (e) {}
    }

    // Get today's date and month (ignoring year)
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-11

    // Fetch all active students
    const students = await prisma.student.findMany({
      where: {
        status: "active",
        dob: {
          not: null
        }
      }
    });

    const birthdayStudents = students.filter(student => {
      if (!student.dob) return false;
      const dob = new Date(student.dob);
      return dob.getDate() === currentDay && dob.getMonth() === currentMonth;
    });

    let sentCount = 0;
    for (const student of birthdayStudents) {
      if (!student.phone) continue;
      
      const message = template.replace(/{name}/g, student.name || "");
      const res = await sendSMS(student.phone, message);
      
      if (res) {
        sentCount++;
        // Log it
        await prisma.smsLog.create({
          data: {
            student_id: student.id,
            phone: student.phone,
            message: message,
            type: "birthday",
            status: "sent",
            sent_at: new Date()
          }
        });
      } else {
        await prisma.smsLog.create({
          data: {
            student_id: student.id,
            phone: student.phone,
            message: message,
            type: "birthday",
            status: "failed",
            sent_at: null
          }
        });
      }
    }

    // Update job last_run
    await prisma.cronJob.update({
      where: { id: jobId },
      data: { last_run: new Date() }
    });

    console.log(`[Worker] Sent birthday SMS to ${sentCount} students.`);
  } catch (error) {
    console.error(`[Worker] Error in processBirthdaySMS:`, error);
  }
}
