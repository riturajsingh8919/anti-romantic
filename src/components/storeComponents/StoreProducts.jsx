"use client";

import React, { useState, useEffect } from "react";
import { Heart, ChevronDown, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion } from "framer-motion";
import Image from "next/image";

function StoreProducts() {
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [maxPrice, setMaxPrice] = useState("10000");
  const [minPrice, setMinPrice] = useState("0");
  const [selectedSize, setSelectedSize] = useState("all");
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  // Dynamic data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productImages, setProductImages] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to default categories
      setCategories([
        { key: "all", label: "all", count: 0 },
        { key: "tops", label: "tops", count: 0 },
        { key: "bottoms", label: "bottoms", count: 0 },
        { key: "dresses", label: "dresses", count: 0 },
        { key: "sets", label: "sets", count: 0 },
      ]);
    }
  };

  // Fetch product images from image manager
  const fetchProductImages = async () => {
    try {
      console.log("Fetching product images from image manager...");
      const response = await fetch("/api/admin/image-manager?limit=1000");
      const result = await response.json();

      console.log("Image manager API response:", result);

      if (result.success) {
        // Create a mapping of productId to images
        const imageMap = {};
        result.data.forEach((item) => {
          console.log("Processing item:", item);
          console.log("Item productId:", item.productId);
          console.log("Type of productId:", typeof item.productId);

          // Handle different productId formats
          let productIdString;
          if (typeof item.productId === "string") {
            productIdString = item.productId;
          } else if (item.productId && item.productId._id) {
            productIdString = item.productId._id;
          } else if (item.productId && item.productId.$oid) {
            productIdString = item.productId.$oid;
          } else {
            productIdString = item.productId.toString();
          }

          console.log("Final productIdString:", productIdString);

          imageMap[productIdString] = {
            normalVideo: item.normalVideo,
            normalImage: item.normalImage,
            hoverImage: item.hoverImage,
            hasVideo: item.hasVideo,
          };
        });
        console.log("Created image map:", imageMap);
        setProductImages(imageMap);
      } else {
        console.error("Image manager API error:", result.error);
      }
    } catch (error) {
      console.error("Error fetching product images:", error);
    }
  };

  // Fetch products with current filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: sortBy,
      });

      // Add category filter
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      // Add price range filters
      if (minPrice && minPrice > 0) {
        params.append("minPrice", minPrice);
      }
      if (maxPrice && maxPrice > 0) {
        params.append("maxPrice", maxPrice);
      }

      // Add size filter
      if (selectedSize !== "all") {
        params.append("size", selectedSize);
      }

      const response = await fetch(`/api/products?${params}`);
      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
        setPagination(result.pagination);
        setError(null);
      } else {
        throw new Error(result.error || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle wishlist status
  const handleWishlistToggle = (product, e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  // Navigate to product page
  const handleProductClick = (slug) => {
    router.push(`/store/${slug}`);
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchProductImages();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [
    selectedCategory,
    sortBy,
    minPrice,
    maxPrice,
    selectedSize,
    pagination.page,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [selectedCategory, sortBy, minPrice, maxPrice, selectedSize]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowSortDropdown(false);
        setShowFilterDropdown(false);
        setShowSizeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #28251f;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: none;
        }
        .range-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #28251f;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: none;
        }
        .range-slider::-webkit-slider-track {
          height: 4px;
          cursor: pointer;
          background: transparent;
        }
        .range-slider::-moz-range-track {
          height: 4px;
          cursor: pointer;
          background: transparent;
        }
      `}</style>
      <div className="relative bg-[url('/store/store-sec-bg.png')] bg-no-repeat bg-cover bg-center px-4 md:px-10">
        <div className="container pt-12">
          {/* Page Title */}
          <h1 className="text-4xl font-light text-[#656056] mb-12">shop</h1>

          {/* Navigation and Controls */}
          <div className="flex flex-col md:flex-row justify-between gap-4 lg:items-center mb-16 pb-4 border-b-2 border-[#D0C9BE]">
            {/* Category Navigation */}
            <div className="flex gap-8">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`
                text-lg font-normal tracking-wide transition-all duration-300 cursor-pointer
                ${
                  selectedCategory === category.key
                    ? "text-[#28251F] border-b border-[#28251F] pb-1 !font-medium"
                    : "text-[#312D26] hover:text-gray-700"
                }
              `}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Sort and Filter Controls */}
            <div className="self-end lg:self-auto flex gap-6 text-lg text-[#312D26] relative dropdown-container">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowFilterDropdown(false);
                  }}
                  className="flex items-center gap-1 hover:text-black transition-colors cursor-pointer"
                >
                  sort by
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showSortDropdown && (
                  <div className="absolute top-8 right-0 bg-[#F7F5EB]/85 border border-gray-200 rounded-sm shadow-lg py-2 min-w-[180px] z-10">
                    <button
                      onClick={() => {
                        setSortBy("price-low-high");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-base cursor-pointer hover:bg-white  ${
                        sortBy === "price-low-high"
                          ? "text-[#312D26] bg-white"
                          : "text-[#312D26]"
                      }`}
                    >
                      Price: Low to High
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("price-high-low");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-base cursor-pointer hover:bg-white ${
                        sortBy === "price-high-low"
                          ? "text-[#312D26] bg-white"
                          : "text-[#312D26]"
                      }`}
                    >
                      Price: High to Low
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("date-newest");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-base cursor-pointer hover:bg-white ${
                        sortBy === "date-newest"
                          ? "text-[#312D26] bg-white"
                          : "text-[#312D26]"
                      }`}
                    >
                      Date: Newest First
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("date-oldest");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-base cursor-pointer hover:bg-white ${
                        sortBy === "date-oldest"
                          ? "text-[#312D26] bg-white"
                          : "text-[#312D26]"
                      }`}
                    >
                      Date: Oldest First
                    </button>
                  </div>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowFilterDropdown(!showFilterDropdown);
                    setShowSortDropdown(false);
                  }}
                  className="flex items-center gap-1 hover:text-black transition-colors cursor-pointer"
                >
                  filter
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showFilterDropdown && (
                  <div className="absolute top-8 right-0 bg-[#F7F5EB]/85 border border-[#D0C9BE] rounded-sm shadow-lg pt-4 pb-8 min-w-[300px] z-10">
                    {/* Size Filter */}
                    <div className="px-4 pb-4 border-b border-[#D0C9BE]">
                      <h4 className="text-lg text-[#28251F] mb-3 font-normal">
                        Filter by Size
                      </h4>
                      <div className="relative">
                        <button
                          onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                          className="w-full flex items-center justify-between px-3 py-2 border border-[#D0C9BE] bg-[#F7F5EB]/80 text-[#28251F] text-sm hover:border-[#736C5F] focus:outline-none focus:ring-1 focus:ring-[#736C5F]"
                        >
                          <span>
                            {selectedSize === "all"
                              ? "All Sizes"
                              : selectedSize.toUpperCase()}
                          </span>
                          <ChevronDown className="w-4 h-4" />
                        </button>

                        {showSizeDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-[#F7F5EB] border border-[#D0C9BE] rounded-sm shadow-lg py-1 z-20">
                            <button
                              onClick={() => {
                                setSelectedSize("all");
                                setShowSizeDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#F7F5EB] ${
                                selectedSize === "all"
                                  ? "bg-[#E4DFD3] text-[#28251F]"
                                  : "text-[#312D26]"
                              }`}
                            >
                              All Sizes
                            </button>
                            {["xs", "s", "m", "l", "xl", "2xl"].map((size) => (
                              <button
                                key={size}
                                onClick={() => {
                                  setSelectedSize(size);
                                  setShowSizeDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-[#F7F5EB] uppercase ${
                                  selectedSize === size
                                    ? "bg-[#E4DFD3] text-[#28251F]"
                                    : "text-[#312D26]"
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="px-4 pt-4">
                      <h4 className="text-lg text-[#28251F] mb-3 font-normal">
                        Price Range
                      </h4>
                      <div className="space-y-4">
                        {/* Price Range Display */}
                        <div className="flex items-center justify-between text-sm text-[#736C5F]">
                          <span>₹{minPrice}</span>
                          <span>₹{maxPrice}</span>
                        </div>

                        {/* Dual Range Slider */}
                        <div className="relative">
                          <input
                            type="range"
                            min="0"
                            max="10000"
                            step="100"
                            value={minPrice}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value <= parseInt(maxPrice)) {
                                setMinPrice(value.toString());
                              }
                            }}
                            className="absolute w-full h-2 bg-[#D0C9BE] rounded-lg appearance-none cursor-pointer range-slider"
                            style={{
                              background: `linear-gradient(to right, #D0C9BE 0%, #D0C9BE ${
                                (minPrice / 10000) * 100
                              }%, #736C5F ${
                                (minPrice / 10000) * 100
                              }%, #736C5F ${
                                (maxPrice / 10000) * 100
                              }%, #D0C9BE ${
                                (maxPrice / 10000) * 100
                              }%, #D0C9BE 100%)`,
                            }}
                          />
                          <input
                            type="range"
                            min="0"
                            max="10000"
                            step="100"
                            value={maxPrice}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value >= parseInt(minPrice)) {
                                setMaxPrice(value.toString());
                              }
                            }}
                            className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer range-slider"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square mb-6 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-base mb-4">{error}</p>
              <button
                onClick={fetchProducts}
                className="px-6 py-2 bg-[#28251F] text-white rounded hover:bg-[#1a1715] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-16">
              {products.map((product, index) => {
                console.log(`Product ${product.name} (ID: ${product._id}):`, {
                  hasImageManagerData: !!productImages[product._id],
                  imageManagerData: productImages[product._id],
                  fallbackImage: product.images?.[0]?.url,
                });

                return (
                  <motion.div
                    key={product._id}
                    className="group cursor-pointer"
                    onClick={() => handleProductClick(product.slug)}
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: {
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                        delay: (index % 4) * 0.1, // Stagger by column
                      },
                    }}
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    {/* Product Image Container with Hover Overlay */}
                    <div className="relative bg-gray-100 mb-6 overflow-hidden aspect-[3/4]">
                      {/* Default Media - Video or Normal Image */}
                      {productImages[product._id]?.hasVideo &&
                      productImages[product._id]?.normalVideo ? (
                        <video
                          src={productImages[product._id].normalVideo.url}
                          className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-700 ease-in-out"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          src={
                            productImages[product._id]?.normalImage?.url ||
                            product.images?.[0]?.url ||
                            "/store/product1.png"
                          }
                          alt={
                            productImages[product._id]?.normalImage?.alt ||
                            product.images?.[0]?.alt ||
                            product.name
                          }
                          className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-700 ease-in-out"
                        />
                      )}

                      {/* Hover Image */}
                      {productImages[product._id]?.hoverImage && (
                        <img
                          src={productImages[product._id].hoverImage.url}
                          alt={
                            productImages[product._id].hoverImage.alt ||
                            product.name
                          }
                          className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
                        />
                      )}

                      {/* Featured Badge */}
                      {product.isFeatured && (
                        <div className="absolute top-3 left-3 bg-[#28251F] text-white px-2 py-1 text-base font-medium rounded">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex justify-between items-start">
                      <div className="text-left flex-1">
                        <h3 className="text-base font-normal text-[#28251F] mb-1 tracking-wide capitalize">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-lg text-[#736C5F] font-medium">
                            inr {product.price.toLocaleString()}
                          </p>
                          {/* {product.comparePrice &&
                          product.comparePrice > product.price && (
                            <p className="text-base text-[#736C5F] line-through">
                              inr {product.comparePrice.toLocaleString()}
                            </p>
                          )} */}
                        </div>

                        {/* Color and Stock Info */}
                        <div className="flex items-center gap-2 text-base text-gray-500">
                          {product.totalStock <= 5 &&
                            product.totalStock > 0 && (
                              <span className="text-orange-500 font-medium">
                                Only {product.totalStock} left
                              </span>
                            )}
                        </div>
                      </div>

                      {/* Wishlist Heart Icon */}
                      <button
                        onClick={(e) => handleWishlistToggle(product, e)}
                        className="transition-all duration-300 hover:scale-110 cursor-pointer ml-2"
                        title={
                          isInWishlist(product._id)
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        <Heart
                          className={`w-5 h-5 font-medium ${
                            isInWishlist(product._id)
                              ? "text-[#B7CEDA] fill-[#B7CEDA]"
                              : "text-[#28251F] hover:text-[#28251F]"
                          }`}
                          strokeWidth={1.5}
                        />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {/* Single hero image to fill remaining space - only show if exactly 6 products */}
              {products.length === 6 && (
                <motion.div
                  className="md:col-span-2 flex justify-center"
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: {
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                      delay: (products.length % 4) * 0.1,
                    },
                  }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <Image
                    width={604}
                    height={721}
                    src="/hero-left.png"
                    alt="Antiromantic Collection"
                    className="w-auto h-full md:h-[65vh] xl:h-[80vh] object-cover"
                  />
                </motion.div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="flex flex-col items-center py-16">
              <Image
                src="/empty.svg"
                alt="Empty Wishlist"
                width={140}
                height={233}
                className="mx-auto w-20 h-auto"
              />
              <p className="text-gray-500 text-base mt-2">
                No products found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setPriceRange("all");
                  setSortBy("featured");
                  setMinPrice("0");
                  setMaxPrice("10000");
                  setSelectedSize("all");
                  setSizeFilter("all");
                }}
                className="mt-4 bg-[#E4DFD3] text-[#736C5F] py-3 px-6 text-lg font-bold tracking-wider hover:bg-[#28251F] hover:text-white transition-colors flex items-center justify-center gap-2 border-b-2 border-[#736C5F] cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-16">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={!pagination.hasPrev}
                className={`px-4 py-2 rounded transition-colors ${
                  pagination.hasPrev
                    ? "bg-[#28251F] text-white hover:bg-[#1a1715]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Previous
              </button>

              <span className="text-[#28251F] font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={!pagination.hasNext}
                className={`px-4 py-2 rounded transition-colors ${
                  pagination.hasNext
                    ? "bg-[#28251F] text-white hover:bg-[#1a1715]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default StoreProducts;
