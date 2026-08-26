import { NextResponse } from "next/server";

/** @deprecated Use PATCH /api/admin/curriculum/[id]/draft with client-side scheduler */
export async function POST() {
  return NextResponse.json(
    {
      error: "Deprecated. Use the planner draft autosave + client scheduler instead.",
      migrate_to: "PATCH /api/admin/curriculum/[id]/draft",
    },
    { status: 410 }
  );
}
