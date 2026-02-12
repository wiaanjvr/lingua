import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level");
  const phase = searchParams.get("phase");
  const order = searchParams.get("order");

  try {
    const supabase = await createClient();

    // Build query
    let query = supabase.from("foundation_lessons").select("*");

    // Filter by level
    if (level) {
      query = query.eq("level", level);
    }

    // Filter by phase
    if (phase) {
      query = query.eq("phase", phase);
    }

    // Get specific lesson by order
    if (order) {
      const orderNum = parseInt(order, 10);
      query = query.eq("order", orderNum);

      const { data: lessons, error } = await query;

      if (error) {
        console.error("Error fetching foundation lesson:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(lessons?.[0] || null);
    }

    // Sort by order
    query = query.order("order", { ascending: true });

    const { data: lessons, error } = await query;

    if (error) {
      console.error("Error fetching foundation lessons:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(lessons || []);
  } catch (error) {
    console.error("Error in foundation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
