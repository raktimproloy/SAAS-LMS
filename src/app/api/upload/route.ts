import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkPermission() {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value || cookieStore.get("student_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  return true; // Any authenticated admin or student can upload
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

    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB limit
    const fileUrls: string[] = [];

    for (const file of allFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File ${file.name} exceeds the 20MB size limit.` }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const isPdfOrDoc = file.name.toLowerCase().match(/\.(pdf|doc|docx|txt|xls|xlsx|csv|zip|rar)$/i);
      // Document files must use resource_type "raw". With "auto", Cloudinary detects PDFs
      // as an "image" resource (since it can render PDF pages as images), which duplicates
      // the extension in the public_id (e.g. "file.pdf.pdf") and produces a broken delivery URL.
      const rType = isPdfOrDoc ? "raw" : "auto";

      // Create a clean, unique public_id that preserves the original file extension and name
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniquePublicId = `${Date.now()}_${sanitizedName}`;

      const uploadResult = await new Promise<{ secure_url: string; resource_type: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: "doctor_biology_uploads",
            resource_type: rType,
            public_id: uniquePublicId
          },
          (error, result) => {
            if (error) return reject(error);
            if (result) return resolve(result as any);
          }
        );
        uploadStream.end(buffer);
      });

      let finalUrl = uploadResult.secure_url;

      // Automatically apply Cloudinary's smart compression and explicitly convert to WebP
      // without changing their intrinsic dimensions/resolution, EXCEPT for raw files
      if (uploadResult.resource_type === "image" && !isPdfOrDoc) {
        finalUrl = finalUrl.replace("/upload/", "/upload/f_webp,q_auto/");
      }

      fileUrls.push(finalUrl);
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
