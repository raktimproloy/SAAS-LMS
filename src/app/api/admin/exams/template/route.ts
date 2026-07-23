import { NextResponse } from "next/server";
import * as xlsx from "xlsx";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "xlsx";

  // Define the template structure
  const templateData = [
    {
      Type: "passage",
      Question: "Read the following passage and answer the questions below: 'Photosynthesis is the process used by plants...'",
      Option1: "", Option2: "", Option3: "", Option4: "", Option5: "",
      CorrectOption: "",
      Marks: "0",
      Explanation: "This is a passage block. Do not provide options or correct answer here."
    },
    {
      Type: "mcq",
      Question: "What process is used by plants?",
      Option1: "Respiration", Option2: "Photosynthesis", Option3: "Digestion", Option4: "Transpiration", Option5: "",
      CorrectOption: "2",
      Marks: "1",
      Explanation: "Photosynthesis is the correct answer based on the passage."
    },
    {
      Type: "mcq",
      Question: "What is the capital of France?",
      Option1: "London", Option2: "Berlin", Option3: "Paris", Option4: "Madrid", Option5: "",
      CorrectOption: "3",
      Marks: "1",
      Explanation: "Paris is the capital."
    }
  ];

  if (type === "csv") {
    const csvContent = xlsx.utils.sheet_to_csv(xlsx.utils.json_to_sheet(templateData));
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="exam_template.csv"`,
      },
    });
  } else {
    // Generate XLSX
    const sheet = xlsx.utils.json_to_sheet(templateData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, sheet, "Template");
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="exam_template.xlsx"`,
      },
    });
  }
}
