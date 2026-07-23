import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import * as xlsx from "xlsx";
import mammoth from "mammoth";

async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const examId = parseInt(params.id);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let currentSortOrder = await prisma.examQuestion.count({ where: { exam_id: examId } });

    // Parse Excel/CSV
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".csv")) {
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = xlsx.utils.sheet_to_json(sheet);

      let currentPassageId: number | null = null;

      for (const row of rows) {
        const type = (row.Type || "mcq").toLowerCase();
        
        if (type === "passage") {
          // It's a passage parent
          const newPassage = await prisma.examQuestion.create({
            data: {
              exam_id: examId,
              type: "passage",
              question_text: row.Question || "Untitled Passage",
              sort_order: currentSortOrder++,
              marks: parseFloat(row.Marks || "0"),
              explanation: row.Explanation || null,
            }
          });
          currentPassageId = newPassage.id;
        } else {
          // Standard MCQ or passage child
          const options = [];
          if (row.Option1) options.push({ id: "1", text: row.Option1 });
          if (row.Option2) options.push({ id: "2", text: row.Option2 });
          if (row.Option3) options.push({ id: "3", text: row.Option3 });
          if (row.Option4) options.push({ id: "4", text: row.Option4 });
          if (row.Option5) options.push({ id: "5", text: row.Option5 });
          
          let correctOption = null;
          if (row.CorrectOption) {
            // Can be "1", "2" or text. We assume it matches the ID directly
            correctOption = row.CorrectOption.toString();
          }

          await prisma.examQuestion.create({
            data: {
              exam_id: examId,
              type: "mcq",
              parent_id: currentPassageId, // Links to passage if it exists in scope
              question_text: row.Question || "Untitled Question",
              options: options,
              correct_option: correctOption,
              marks: parseFloat(row.Marks || "1"),
              explanation: row.Explanation || null,
              sort_order: currentSortOrder++
            }
          });
        }
      }
    } 
    // Parse DOCX
    else if (file.name.endsWith(".docx")) {
      const { value: text } = await mammoth.extractRawText({ buffer });
      // A very basic text parser. Real-world docx parsing is complex without strict formats.
      const lines = text.split('\n').filter(l => l.trim() !== "");
      
      let currentOptions = [];
      let currentQuestion = "";
      const currentMarks = 1;
      
      for (const line of lines) {
        if (line.toLowerCase().startsWith("q:")) {
          // Save previous if exists
          if (currentQuestion) {
            await prisma.examQuestion.create({
              data: {
                exam_id: examId,
                type: "mcq",
                question_text: currentQuestion,
                options: currentOptions,
                marks: currentMarks,
                sort_order: currentSortOrder++
              }
            });
          }
          currentQuestion = line.substring(2).trim();
          currentOptions = [];
        } else if (line.toLowerCase().startsWith("opt:")) {
          currentOptions.push({ id: (currentOptions.length + 1).toString(), text: line.substring(4).trim() });
        }
      }
      
      // Save last
      if (currentQuestion) {
        await prisma.examQuestion.create({
          data: {
            exam_id: examId,
            type: "mcq",
            question_text: currentQuestion,
            options: currentOptions,
            marks: currentMarks,
            sort_order: currentSortOrder++
          }
        });
      }
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to upload and parse file" }, { status: 500 });
  }
}
