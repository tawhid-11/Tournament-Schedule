import { NextRequest, NextResponse } from "next/server";
import { tournamentStore } from "@/lib/tournament-store";
import { AutoScheduleSchema } from "@/lib/validations/tournament.schema";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = AutoScheduleSchema.parse(body);

    const updated = tournamentStore.autoSchedule(params.id, {
      startDate: new Date(validated.startDate),
      timeSlots: validated.timeSlots,
      minRestDays: validated.minRestDays,
    });

    if (!updated) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({
      matches: updated.matches,
      conflicts: updated.conflicts,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.errors ? err.errors[0].message : err.message },
      { status: 400 }
    );
  }
}
