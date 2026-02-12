import { NextRequest, NextResponse } from "next/server";
import segments from "@/data/segments.json";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parse query parameters
  const level = searchParams.get("level");
  const topic = searchParams.get("topic");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const excludeIds = searchParams.get("exclude")?.split(",") || [];

  // Filter segments
  let filteredSegments = segments.filter((segment) => {
    if (level && segment.level !== level) return false;
    if (topic && segment.topic !== topic) return false;
    if (excludeIds.includes(segment.id)) return false;
    return true;
  });

  // Calculate pagination
  const total = filteredSegments.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedSegments = filteredSegments.slice(start, end);

  // Return paginated response
  return NextResponse.json({
    segments: paginatedSegments,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  });
}
