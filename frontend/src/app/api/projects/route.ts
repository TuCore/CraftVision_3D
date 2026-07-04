import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch from actual database
  return NextResponse.json({
    projects: [
      { id: "1", name: "Hộp quà 3D", status: "completed" },
      { id: "2", name: "Thiệp pop-up", status: "in-progress" }
    ]
  });
}
