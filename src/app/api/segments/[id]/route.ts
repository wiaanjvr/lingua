import { NextRequest, NextResponse } from "next/server";
import segments from "@/data/segments.json";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const segment = segments.find((s) => s.id === params.id);

  if (!segment) {
    return NextResponse.json({ error: "Segment not found" }, { status: 404 });
  }

  return NextResponse.json(segment);
}
