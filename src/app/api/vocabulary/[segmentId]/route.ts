import { NextRequest, NextResponse } from "next/server";
import vocabulary from "@/data/vocabulary.json";

export async function GET(
  request: NextRequest,
  { params }: { params: { segmentId: string } },
) {
  const exercises = vocabulary[params.segmentId as keyof typeof vocabulary];

  if (!exercises) {
    return NextResponse.json(
      { error: "Vocabulary not found for this segment" },
      { status: 404 },
    );
  }

  return NextResponse.json(exercises);
}
