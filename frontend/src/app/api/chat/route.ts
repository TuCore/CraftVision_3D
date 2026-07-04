import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // TODO: Connect to your AI service or backend here
    console.log("Chat request received:", body.message);

    return NextResponse.json({
      role: "ai",
      content: "Đây là câu trả lời mẫu từ API stubs của Next.js.",
      suggestions: [
        { level: "Cơ bản", title: "Thiệp pop-up trái tim", time: "45 phút", price: "~30.000đ" }
      ]
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 }
    );
  }
}
