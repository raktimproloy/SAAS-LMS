import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

async function checkPermission() {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  return true; // Any authenticated admin can upload
}

export async function POST(request: Request) {
  const isAuth = await checkPermission();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    
    // Support both 'files' (multiple) and 'file' (single)
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;
    
    const allFiles = [...files];
    if (singleFile && !allFiles.some(f => f.name === singleFile.name && f.size === singleFile.size)) {
      allFiles.push(singleFile);
    }

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Ensure public/uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Directory already exists or can't be created
    }

    const fileUrls: string[] = [];

    for (const file of allFiles) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const originalExt = path.extname(file.name);
      const fileName = `upload-${uniqueSuffix}${originalExt}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      fileUrls.push(`/uploads/${fileName}`);
    }

    // Return urls array, and url as the first one for backward compatibility
    return NextResponse.json({ 
      success: true, 
      url: fileUrls[0],
      urls: fileUrls 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}
