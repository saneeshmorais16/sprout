import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "NOT_REQUIRED", retired: true });
}
