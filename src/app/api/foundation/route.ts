import { NextResponse } from "next/server";
import foundationLessons from "@/data/foundation-lessons.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level");
  const phase = searchParams.get("phase");
  const order = searchParams.get("order");

  let lessons = foundationLessons;

  // Filter by level
  if (level) {
    lessons = lessons.filter((lesson) => lesson.level === level);
  }

  // Filter by phase
  if (phase) {
    lessons = lessons.filter((lesson) => lesson.phase === phase);
  }

  // Get specific lesson by order
  if (order) {
    const orderNum = parseInt(order, 10);
    const lesson = lessons.find((l) => l.order === orderNum);
    return NextResponse.json(lesson || null);
  }

  // Sort by order
  lessons.sort((a, b) => a.order - b.order);

  return NextResponse.json(lessons);
}
