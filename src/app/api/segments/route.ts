import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parse query parameters
  const level = searchParams.get("level");
  const topic = searchParams.get("topic");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const excludeIds = searchParams.get("exclude")?.split(",") || [];

  try {
    const supabase = await createClient();

    // Build query
    let query = supabase
      .from("content_segments")
      .select("*", { count: "exact" });

    // Apply filters
    if (level) {
      query = query.eq("level", level);
    }
    if (topic) {
      query = query.eq("topic", topic);
    }
    if (excludeIds.length > 0 && excludeIds[0] !== "") {
      query = query.not("id", "in", `(${excludeIds.join(",")})`);
    }

    // Apply pagination
    const start = (page - 1) * limit;
    query = query.range(start, start + limit - 1);

    const { data: segments, count, error } = await query;

    if (error) {
      console.error("Error fetching segments:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // Return paginated response
    return NextResponse.json({
      segments: segments || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error in segments API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
