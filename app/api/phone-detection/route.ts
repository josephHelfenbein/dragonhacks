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
    const isOnPhone = Math.random() > 0.7;
    
    return NextResponse.json({
      phoneDetected: isOnPhone,
      confidence: isOnPhone ? 0.92 : 0.87,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing phone detection:", error);
    return NextResponse.json(
      { error: "Failed to process phone detection" },
      { status: 500 }
    );
  }
}
