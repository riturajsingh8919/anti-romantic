import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/lib/mongodb";
import ProductImageManager from "@/models/ProductImageManager";
import Product from "@/models/Product";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET all product image managers with pagination and filtering
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const productId = searchParams.get("productId");
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (productId) filter.productId = productId;
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      filter.isActive = isActive === "true";
    }

    const [productImageManagers, total] = await Promise.all([
      ProductImageManager.find(filter)
        .populate("productId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProductImageManager.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: productImageManagers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching product image managers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product image managers" },
      { status: 500 }
    );
  }
}

// POST - Create new product image manager
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // Basic validation
    if (!body.productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (!body.normalVideo && !body.normalImage) {
      return NextResponse.json(
        {
          success: false,
          error: "Either normal video or normal image is required",
        },
        { status: 400 }
      );
    }

    if (body.normalVideo && body.normalImage) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot have both video and normal image",
        },
        { status: 400 }
      );
    }

    if (!body.hoverImage) {
      return NextResponse.json(
        {
          success: false,
          error: "Hover image is required",
        },
        { status: 400 }
      );
    }

    // Check if trying to add video when another product already has video
    if (body.normalVideo) {
      const existingVideoProduct = await ProductImageManager.findOne({
        hasVideo: true,
      });
      if (
        existingVideoProduct &&
        existingVideoProduct.productId.toString() !== body.productId
      ) {
        const productWithVideo = await existingVideoProduct.populate(
          "productId",
          "name"
        );
        return NextResponse.json(
          {
            success: false,
            error: `Only one product can have video. Currently "${productWithVideo.productId.name}" has video.`,
          },
          { status: 409 }
        );
      }
    }

    // Check if product exists
    const product = await Product.findById(body.productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product image manager already exists
    const existingImageManager = await ProductImageManager.findOne({
      productId: body.productId,
    });

    if (existingImageManager) {
      return NextResponse.json(
        {
          success: false,
          error: "Product image manager already exists. Use PUT to update.",
        },
        { status: 409 }
      );
    }

    // Create new product image manager
    const productImageManagerData = {
      productId: body.productId,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    // Add normal media (either video or image)
    if (body.normalVideo) {
      productImageManagerData.normalVideo = body.normalVideo;
      productImageManagerData.hasVideo = true;
    } else if (body.normalImage) {
      productImageManagerData.normalImage = body.normalImage;
    }

    // Always add hover image (required for both video and image)
    productImageManagerData.hoverImage = body.hoverImage;

    const productImageManager = new ProductImageManager(
      productImageManagerData
    );

    await productImageManager.save();

    // Populate the product information
    await productImageManager.populate("productId", "name");

    return NextResponse.json({
      success: true,
      data: productImageManager,
      message: "Product image manager created successfully",
    });
  } catch (error) {
    console.error("Error creating product image manager:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product image manager" },
      { status: 500 }
    );
  }
}

// PUT - Update existing product image manager
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body._id) {
      return NextResponse.json(
        { success: false, error: "Product image manager ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.normalVideo && !body.normalImage) {
      return NextResponse.json(
        {
          success: false,
          error: "Either normal video or normal image is required",
        },
        { status: 400 }
      );
    }

    if (body.normalVideo && body.normalImage) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot have both video and normal image",
        },
        { status: 400 }
      );
    }

    if (!body.hoverImage) {
      return NextResponse.json(
        {
          success: false,
          error: "Hover image is required",
        },
        { status: 400 }
      );
    }

    // Find the existing product image manager
    const productImageManager = await ProductImageManager.findById(body._id);

    if (!productImageManager) {
      return NextResponse.json(
        { success: false, error: "Product image manager not found" },
        { status: 404 }
      );
    }

    // Check if trying to add video when another product already has video
    if (body.normalVideo && !productImageManager.hasVideo) {
      const existingVideoProduct = await ProductImageManager.findOne({
        hasVideo: true,
        _id: { $ne: body._id },
      });
      if (existingVideoProduct) {
        const productWithVideo = await existingVideoProduct.populate(
          "productId",
          "name"
        );
        return NextResponse.json(
          {
            success: false,
            error: `Only one product can have video. Currently "${productWithVideo.productId.name}" has video.`,
          },
          { status: 409 }
        );
      }
    }

    // Handle cleanup of old media files

    // Clean up old normal media if switching types
    if (body.normalVideo && productImageManager.normalImage) {
      // Switching from image to video - delete old normal image
      try {
        await cloudinary.uploader.destroy(
          productImageManager.normalImage.publicId
        );
      } catch (deleteError) {
        console.warn(
          "Warning: Failed to delete old normal image from Cloudinary:",
          deleteError
        );
      }
    } else if (body.normalImage && productImageManager.normalVideo) {
      // Switching from video to image - delete old normal video
      try {
        await cloudinary.uploader.destroy(
          productImageManager.normalVideo.publicId,
          { resource_type: "video" }
        );
      } catch (deleteError) {
        console.warn(
          "Warning: Failed to delete old normal video from Cloudinary:",
          deleteError
        );
      }
    } else if (
      body.normalImage &&
      productImageManager.normalImage &&
      body.normalImage.publicId !== productImageManager.normalImage.publicId
    ) {
      // Updating normal image - delete old image
      try {
        await cloudinary.uploader.destroy(
          productImageManager.normalImage.publicId
        );
      } catch (deleteError) {
        console.warn(
          "Warning: Failed to delete old normal image from Cloudinary:",
          deleteError
        );
      }
    } else if (
      body.normalVideo &&
      productImageManager.normalVideo &&
      body.normalVideo.publicId !== productImageManager.normalVideo.publicId
    ) {
      // Updating normal video - delete old video
      try {
        await cloudinary.uploader.destroy(
          productImageManager.normalVideo.publicId,
          { resource_type: "video" }
        );
      } catch (deleteError) {
        console.warn(
          "Warning: Failed to delete old normal video from Cloudinary:",
          deleteError
        );
      }
    }

    // Clean up old hover image if updating it
    if (
      body.hoverImage &&
      productImageManager.hoverImage &&
      body.hoverImage.publicId !== productImageManager.hoverImage.publicId
    ) {
      try {
        await cloudinary.uploader.destroy(
          productImageManager.hoverImage.publicId
        );
      } catch (deleteError) {
        console.warn(
          "Warning: Failed to delete old hover image from Cloudinary:",
          deleteError
        );
      }
    }

    // Update the fields

    // Handle normal media updates
    if (body.normalVideo) {
      productImageManager.normalVideo = body.normalVideo;
      productImageManager.normalImage = undefined;
      productImageManager.hasVideo = true;
    } else if (body.normalImage) {
      productImageManager.normalImage = body.normalImage;
      productImageManager.normalVideo = undefined;
      productImageManager.hasVideo = false;
    }

    // Always update hover image (required for both video and image)
    productImageManager.hoverImage = body.hoverImage;

    if (body.isActive !== undefined)
      productImageManager.isActive = body.isActive;

    await productImageManager.save();

    // Populate the product information
    await productImageManager.populate("productId", "name");

    return NextResponse.json({
      success: true,
      data: productImageManager,
      message: "Product image manager updated successfully",
    });
  } catch (error) {
    console.error("Error updating product image manager:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product image manager" },
      { status: 500 }
    );
  }
}
