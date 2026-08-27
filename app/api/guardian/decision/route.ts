import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Parent/guardian approval is not part of the current GROW experience." },
    { status: 410 },
  );
}
