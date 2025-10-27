import mongoose from "mongoose";

const ProductImageManagerSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
      unique: true, // Each product can have only one image manager entry
    },
    normalVideo: {
      url: { type: String },
      publicId: { type: String },
      duration: { type: Number },
      format: { type: String },
      size: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    normalImage: {
      url: { type: String },
      publicId: { type: String },
      alt: { type: String, default: "" },
      width: { type: Number },
      height: { type: Number },
      format: { type: String },
      size: { type: Number },
    },
    hoverImage: {
      url: { type: String },
      publicId: { type: String },
      alt: { type: String, default: "" },
      width: { type: Number },
      height: { type: Number },
      format: { type: String },
      size: { type: Number },
    },
    hasVideo: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Simple validation - either video or image is required, hover image is always required
ProductImageManagerSchema.pre("save", function (next) {
  // Must have either video or normal image
  if (!this.normalVideo?.url && !this.normalImage?.url) {
    return next(new Error("Either normal video or normal image is required"));
  }

  // Cannot have both video and normal image
  if (this.normalVideo?.url && this.normalImage?.url) {
    return next(new Error("Cannot have both video and normal image"));
  }

  // Hover image is always required
  if (!this.hoverImage?.url) {
    return next(new Error("Hover image is required"));
  }

  // Set hasVideo flag
  this.hasVideo = Boolean(this.normalVideo?.url);
  next();
});

// Static method to check if any product has video
ProductImageManagerSchema.statics.hasAnyProductWithVideo = async function () {
  const count = await this.countDocuments({ hasVideo: true });
  return count > 0;
};

// Static method to get product with video
ProductImageManagerSchema.statics.getProductWithVideo = async function () {
  return await this.findOne({ hasVideo: true }).populate("productId");
};

const ProductImageManager =
  mongoose.models.ProductImageManager ||
  mongoose.model("ProductImageManager", ProductImageManagerSchema);

export default ProductImageManager;
