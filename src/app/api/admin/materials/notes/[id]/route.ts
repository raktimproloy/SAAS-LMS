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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("materials");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const body = await request.json();
    
    // Accept a partial body for toggles, or a full body for edits
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.file_path !== undefined) updateData.file_path = body.file_path;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.is_public !== undefined) updateData.is_public = body.is_public;
    if (body.collect_lead !== undefined) updateData.collect_lead = body.collect_lead;
    if (body.lead_mandatory !== undefined) updateData.lead_mandatory = body.lead_mandatory;
    if (body.lead_form_message !== undefined) updateData.lead_form_message = body.lead_form_message;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.batch_id !== undefined) updateData.batch_id = body.batch_id ? parseInt(body.batch_id) : null;
    if (body.course_id !== undefined) updateData.course_id = body.course_id ? parseInt(body.course_id) : null;

    const updatedNote = await prisma.noteMaterial.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updatedNote });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update material" }, { status: 500 });
  }
}

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function extractCloudinaryInfo(url: string) {
  if (!url.includes('cloudinary.com')) return null;
  const parts = url.split('/upload/');
  if (parts.length < 2) return null;
  
  const preUpload = parts[0].split('/');
  const resourceType = preUpload[preUpload.length - 1]; 
  
  const pathParts = parts[1].split('/');
  let versionIndex = -1;
  for (let i = 0; i < pathParts.length; i++) {
    if (pathParts[i].match(/^v\d+$/)) {
      versionIndex = i;
      break;
    }
  }
  
  if (versionIndex === -1) return null;
  
  let publicId = pathParts.slice(versionIndex + 1).join('/');
  
  if (resourceType === 'image' || resourceType === 'video') {
    publicId = publicId.replace(/\.[^/.]+$/, "");
  }
  
  return { publicId, resourceType };
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("materials");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const note = await prisma.noteMaterial.findUnique({ where: { id } });
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let urls: string[] = [];
    try {
      if (note.file_path.startsWith('[')) {
        urls = JSON.parse(note.file_path);
      } else {
        urls = [note.file_path];
      }
    } catch {
      urls = [note.file_path];
    }

    for (const url of urls) {
      const info = extractCloudinaryInfo(url);
      if (info) {
        await cloudinary.uploader.destroy(info.publicId, { resource_type: info.resourceType }).catch(console.error);
      }
    }

    await prisma.noteMaterial.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
  }
}
