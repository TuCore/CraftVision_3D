import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // TODO: Connect to your actual backend/database here
    console.log("Login attempt for:", body.email);

    return NextResponse.json({
      success: true,
      token: "dummy_jwt_token",
      user: {
        id: "1",
        name: "Test User",
        email: body.email,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 }
    );
  }
}
