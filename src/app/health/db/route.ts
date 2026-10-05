import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Health check failed:", error);

    return Response.json(
      { ok: false, error: "database unreachable" },
      { status: 503 },
    );
  }
}
