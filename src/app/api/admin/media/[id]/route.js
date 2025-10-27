import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// DELETE image or video from Cloudinary
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Media ID is required" },
        { status: 400 }
      );
    }

    // Decode the public_id (it might be URL encoded)
    const publicId = decodeURIComponent(id);

    // Try deleting as image first, then as video if that fails
    let result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok") {
      // If image deletion failed, try as video
      result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "video",
      });
    }

    if (result.result === "ok") {
      return NextResponse.json({
        success: true,
        message: "Media deleted successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to delete media" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
