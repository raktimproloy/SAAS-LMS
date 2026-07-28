import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const images = await prisma.gallery.findMany({
      orderBy: { sort_order: "asc" },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("Gallery GET error:", error);
    return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image_path, category, caption } = body;

    if (!image_path) {
      return NextResponse.json({ error: "Image path is required" }, { status: 400 });
    }

    // Find the highest sort_order
    const maxOrder = await prisma.gallery.aggregate({
      _max: {
        sort_order: true,
      },
    });

    const nextOrder = (maxOrder._max.sort_order || 0) + 1;

    const newImage = await prisma.gallery.create({
      data: {
        image_path,
        category: category || "home",
        caption: caption || null,
        sort_order: nextOrder,
      },
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Gallery POST error:", error);
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}
