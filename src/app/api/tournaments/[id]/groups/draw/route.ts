import { NextRequest, NextResponse } from "next/server";
import { tournamentStore } from "@/lib/tournament-store";
import { AutoDrawSchema } from "@/lib/validations/tournament.schema";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = AutoDrawSchema.parse(body);

    const updated = tournamentStore.autoDraw(params.id, {
      method: validated.method,
      numberOfGroups: validated.numberOfGroups,
      advancePerGroup: validated.advancePerGroup,
    });

    if (!updated) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({ groups: updated.groups });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.errors ? err.errors[0].message : err.message },
      { status: 400 }
    );
  }
}
