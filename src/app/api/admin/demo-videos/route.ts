import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

export async function GET() {
  const hasPerm = await checkPermission("video_courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const demoVideos = await prisma.demoVideo.findMany({
      orderBy: [
        { sort_order: "asc" },
        { created_at: "desc" }
      ],
    });
    return NextResponse.json(demoVideos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch demo videos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("video_courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { section_title, video_url } = body;

    if (!section_title || !video_url) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    // Fetch YouTube Metadata
    let video_title = "Demo Video";
    let thumbnail_url = "";
    
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(video_url)}&format=json`;
      const ytResponse = await fetch(oembedUrl);
      if (ytResponse.ok) {
        const ytData = await ytResponse.json();
        video_title = ytData.title || video_title;
        thumbnail_url = ytData.thumbnail_url || "";
      } else {
        // Fallback thumbnail logic based on video ID if oembed fails
        const urlParams = new URLSearchParams(new URL(video_url).search);
        const vId = urlParams.get("v");
        if (vId) {
          thumbnail_url = `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;
        }
      }
    } catch (e) {
      console.error("YouTube metadata fetch error:", e);
    }

    const newDemo = await prisma.demoVideo.create({
      data: { 
        section_title, 
        video_url,
        video_title,
        thumbnail_url
      },
    });

    return NextResponse.json({ success: true, data: newDemo }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create demo video" }, { status: 500 });
  }
}
