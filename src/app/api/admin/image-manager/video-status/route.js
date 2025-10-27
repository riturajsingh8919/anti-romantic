import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductImageManager from "@/models/ProductImageManager";

export async function GET() {
  try {
    await connectDB();

    const productWithVideo = await ProductImageManager.getProductWithVideo();

    return NextResponse.json({
      success: true,
      productWithVideo,
    });
  } catch (error) {
    console.error("Error checking video status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check video status",
      },
      { status: 500 }
    );
  }
}
