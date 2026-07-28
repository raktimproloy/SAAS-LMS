import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const { orderedIds } = await req.json();

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Update the sort_order of each image in a transaction
    await prisma.$transaction(
      orderedIds.map((id: number, index: number) =>
        prisma.gallery.update({
          where: { id },
          data: { sort_order: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gallery reorder error:", error);
    return NextResponse.json({ error: "Failed to reorder images" }, { status: 500 });
  }
}
