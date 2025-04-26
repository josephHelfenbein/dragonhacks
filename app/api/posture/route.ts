import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    
    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would call the Go backend
    // For demo, return mock response
    return NextResponse.json({
      posture: Math.random() > 0.3 ? "good" : "bad",
      confidence: 0.85,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing posture detection:", error);
    return NextResponse.json(
      { error: "Failed to process posture detection" },
      { status: 500 }
    );
  }
}
