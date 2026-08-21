"use server";

import prisma from "@/lib/db";

export async function getContactConfig() {
  const settings = await prisma.siteSetting.findMany({
    where: { group_name: "site_config" }
  });
  
  const config = settings.reduce((acc, curr) => {
    acc[curr.setting_key] = curr.setting_value;
    return acc;
  }, {} as Record<string, string>);

  const courses = await prisma.course.findMany({
    where: { status: "active" },
    select: { id: true, title: true }
  });

  return { config, courses };
}

export async function submitContactForm(data: { name: string, phone: string, course_id?: number, message?: string }) {
  try {
    const submission = await prisma.formSubmission.create({
      data: {
        name: data.name,
        phone: data.phone,
        course_id: data.course_id || null,
        message: data.message,
        type: "CONTACT"
      }
    });
    return { success: true };
  } catch (e) {
    console.error("Form submission error:", e);
    return { success: false, error: "Failed to submit" };
  }
}
