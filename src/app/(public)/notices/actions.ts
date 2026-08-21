"use server";
import prisma from "@/lib/db";

export async function getNotices(skip: number, take: number = 10) {
  const notices = await prisma.notice.findMany({
    skip,
    take,
    orderBy: [
      { is_pinned: 'desc' },
      { created_at: 'desc' }
    ]
  });
  
  // We need to stringify/parse to avoid date serialization issues in Server Actions
  return JSON.parse(JSON.stringify(notices));
}
