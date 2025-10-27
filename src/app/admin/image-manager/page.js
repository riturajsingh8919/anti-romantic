"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Image as ImageIcon,
  Package,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { showSuccess, showError, showLoading, dismissToast } from "@/lib/toast";
import { SingleImageUpload } from "@/components/admin/SingleImageUpload";
import { VideoUpload } from "@/components/admin/VideoUpload";

export default function ImageManagerPage() {
  const [productImageManagers, setProductImageManagers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const normalImageUploadRef = useRef(null);
  const hoverImageUploadRef = useRef(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    productId: "",
    normalVideo: null,
    normalImage: null,
    hoverImage: null,
    hasVideo: false,
    isActive: true,
  });
  const [productWithVideo, setProductWithVideo] = useState(null);
  const [showVideoOption, setShowVideoOption] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Effect to handle dialog close cleanup
  useEffect(() => {
    if (!dialogOpen) {
      // Reset form when dialog closes
      setTimeout(() => {
        setEditingItem(null);
        setFormData({
          productId: "",
          normalVideo: null,
          normalImage: null,
          hoverImage: null,
          hasVideo: false,
          isActive: true,
        });
        setShowVideoOption(false);
        // Ensure body pointer-events are reset
        document.body.style.pointerEvents = "";
      }, 100);
    }
  }, [dialogOpen]);

  // Fetch product image managers with pagination
  const fetchProductImageManagers = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/admin/image-manager?page=${currentPage}&limit=${itemsPerPage}`;

      if (selectedProduct && selectedProduct !== "all") {
        url += `&productId=${selectedProduct}`;
      }
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProductImageManagers(data.data);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      } else {
        showError("Failed to fetch product image managers");
      }
    } catch (error) {
      console.error("Error fetching product image managers:", error);
      showError("Failed to fetch product image managers");
    } finally {
      setLoading(false);
    }
  }, [selectedProduct, currentPage, itemsPerPage]);

  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const response = await fetch("/api/admin/products?limit=100");
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      } else {
        showError("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showError("Failed to fetch products");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const checkVideoStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/image-manager/video-status");
      const data = await response.json();

      if (data.success) {
        setProductWithVideo(data.productWithVideo);
      }
    } catch (error) {
      console.error("Error checking video status:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    checkVideoStatus();
  }, [fetchProducts, checkVideoStatus]);

  useEffect(() => {
    fetchProductImageManagers();
  }, [fetchProductImageManagers]);

  // Reset pagination when selected product changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProduct]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.productId) {
      showError("Please select a product");
      return;
    }

    if (!formData.normalVideo && !formData.normalImage) {
      showError("Either normal video or normal image is required");
      return;
    }

    if (formData.normalVideo && formData.normalImage) {
      showError("Cannot have both video and normal image");
      return;
    }

    if (!formData.hoverImage) {
      showError("Hover image is required");
      return;
    }

    // Check if trying to add video to another product when one already has video
    if (
      formData.normalVideo &&
      productWithVideo &&
      productWithVideo.productId._id !== formData.productId
    ) {
      showError(
        `Only one product can have video. Currently "${productWithVideo.productId.name}" has video.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const url = editingItem
        ? "/api/admin/image-manager"
        : "/api/admin/image-manager";
      const method = editingItem ? "PUT" : "POST";

      const payload = editingItem
        ? { ...formData, _id: editingItem._id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(data.message);
        setDialogOpen(false);
        fetchProductImageManagers();
        checkVideoStatus(); // Refresh video status
      } else {
        showError(data.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showError("Failed to save product image manager");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      productId: item.productId._id,
      normalVideo: item.normalVideo,
      normalImage: item.normalImage,
      hoverImage: item.hoverImage,
      hasVideo: item.hasVideo || false,
      isActive: item.isActive,
    });
    setShowVideoOption(item.hasVideo || false);
    setDialogOpen(true);
  };

  const handleDelete = async (item) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product image manager?"
      )
    ) {
      try {
        const response = await fetch(`/api/admin/image-manager/${item._id}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          showSuccess(data.message);
          fetchProductImageManagers();
          checkVideoStatus(); // Refresh video status
        } else {
          showError(data.error || "Failed to delete item");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        showError("Failed to delete item");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      normalVideo: null,
      normalImage: null,
      hoverImage: null,
      hasVideo: false,
      isActive: true,
    });
    setEditingItem(null);
    setShowVideoOption(false);
    if (normalImageUploadRef.current) {
      normalImageUploadRef.current.clearImage &&
        normalImageUploadRef.current.clearImage();
    }
    if (hoverImageUploadRef.current) {
      hoverImageUploadRef.current.clearImage &&
        hoverImageUploadRef.current.clearImage();
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Reset form after a brief delay to allow dialog to close smoothly
    setTimeout(() => {
      resetForm();
    }, 100);
  };

  if (loading && currentPage === 1) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">
              Loading product image managers...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Product Image Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Manage normal images and hover media (images or videos) for each
            product
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setCurrentPage(1)}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product Images
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl w-[95vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-xl font-semibold">
                  {editingItem ? "Edit Product Images" : "Add Product Images"}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Upload normal image and hover media (image or video) for a
                  product. Normal image is required. Only one product can have
                  video.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                {/* Product Selection */}
                <div className="space-y-2">
                  <Label htmlFor="product" className="text-sm font-medium">
                    Product *
                  </Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, productId: value }))
                    }
                    disabled={editingItem || productsLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product._id} value={product._id}>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span className="truncate">{product.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Images Section */}
                <div className="space-y-6">
                  {/* Normal Media (Image or Video) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Normal Image *
                      </Label>
                      {!editingItem && !productWithVideo && (
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="videoOption" className="text-xs">
                            use video
                          </Label>
                          <Switch
                            id="videoOption"
                            checked={showVideoOption}
                            onCheckedChange={(checked) => {
                              setShowVideoOption(checked);
                              if (checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  normalImage: null,
                                  hasVideo: true,
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  normalVideo: null,
                                  hasVideo: false,
                                }));
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {productWithVideo &&
                      productWithVideo.productId._id !== formData.productId && (
                        <Alert className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Video is already assigned to &ldquo;
                            {productWithVideo.productId.name}&rdquo;. Only one
                            product can have video at a time.
                          </AlertDescription>
                        </Alert>
                      )}

                    <div className="border rounded-lg p-4 bg-gray-50/50">
                      {showVideoOption || formData.hasVideo ? (
                        <VideoUpload
                          value={formData.normalVideo}
                          onChange={(video) =>
                            setFormData((prev) => ({
                              ...prev,
                              normalVideo: video,
                              hasVideo: Boolean(video),
                            }))
                          }
                          label="click to upload normal image"
                          folder="product-image-manager"
                          className="w-full"
                        />
                      ) : (
                        <SingleImageUpload
                          ref={normalImageUploadRef}
                          value={formData.normalImage}
                          onChange={(image) =>
                            setFormData((prev) => ({
                              ...prev,
                              normalImage: image,
                            }))
                          }
                          label="click to upload normal image"
                          folder="product-image-manager"
                          className="w-full"
                        />
                      )}
                    </div>
                  </div>

                  {/* Hover Image (Required) */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Hover Image *</Label>
                    <div className="border rounded-lg p-4 bg-gray-50/50">
                      <SingleImageUpload
                        ref={hoverImageUploadRef}
                        value={formData.hoverImage}
                        onChange={(image) =>
                          setFormData((prev) => ({
                            ...prev,
                            hoverImage: image,
                          }))
                        }
                        label="click to upload hover image"
                        folder="product-image-manager"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Section */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-sm font-medium">Settings</Label>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: checked,
                        }))
                      }
                    />
                    <Label htmlFor="isActive" className="text-sm">
                      Active
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {formData.isActive
                        ? "Images will be visible"
                        : "Images will be hidden"}
                    </span>
                  </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto"
                  >
                    {submitting
                      ? "Saving..."
                      : editingItem
                      ? "Update Images"
                      : "Create Image Manager"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="productFilter">Filter by Product</Label>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Each product can have only one image manager entry with normal image
          and hover media (image or video). Only one product can have video at a
          time. If a product already has media, you can only edit it, not create
          new ones.
        </AlertDescription>
      </Alert>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Image Managers</CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{totalItems} total entries</p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage >= totalPages || loading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            </div>
          ) : productImageManagers.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {selectedProduct && selectedProduct !== "all"
                  ? "No image managers found for selected product"
                  : "No product image managers found"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Create your first product image manager to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Default Media</TableHead>
                  <TableHead>Hover Image</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productImageManagers.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {item.productId?.name || "Unknown Product"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative group">
                        {/* Default Media - Video or Normal Image */}
                        {item.hasVideo && item.normalVideo ? (
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <video
                                src={item.normalVideo.url}
                                width={40}
                                height={40}
                                className="rounded object-cover group-hover:opacity-0 transition-opacity duration-300"
                                muted
                                autoPlay
                                loop
                                playsInline
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded group-hover:opacity-0 transition-opacity duration-300">
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-1 py-0"
                                >
                                  VIDEO
                                </Badge>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.round(item.normalVideo.duration)}s
                            </div>
                          </div>
                        ) : item.normalImage ? (
                          <div className="flex items-center gap-2">
                            <Image
                              src={item.normalImage.url}
                              alt="Normal"
                              width={40}
                              height={40}
                              className="rounded object-cover group-hover:opacity-0 transition-opacity duration-300"
                            />
                            <div className="text-xs text-gray-500">
                              {item.normalImage.width}x{item.normalImage.height}
                            </div>
                          </div>
                        ) : null}

                        {/* Hover Media - Image */}
                        {item.hasVideo &&
                        item.normalVideo &&
                        item.normalImage &&
                        item.normalImage.url ? (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                            <Image
                              src={item.normalImage.url}
                              alt="Normal Image (on hover)"
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                            <div className="text-xs text-gray-500">
                              {item.normalImage.width}x{item.normalImage.height}
                            </div>
                          </div>
                        ) : (
                          item.hoverImage && (
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                              <Image
                                src={item.hoverImage.url}
                                alt="Hover Image"
                                width={40}
                                height={40}
                                className="rounded object-cover"
                              />
                              <div className="text-xs text-gray-500">
                                {item.hoverImage.width}x{item.hoverImage.height}
                              </div>
                            </div>
                          )
                        )}

                        {!item.hasVideo && item.hoverImage && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                            <Image
                              src={item.hoverImage.url}
                              alt="Hover"
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                            <div className="text-xs text-gray-500">
                              {item.hoverImage.width}x{item.hoverImage.height}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.hasVideo &&
                      item.normalVideo &&
                      item.normalImage &&
                      item.normalImage.url ? (
                        <div className="flex items-center gap-2">
                          <Image
                            src={item.normalImage.url}
                            alt="Shows on hover"
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                          <div className="text-xs text-gray-500">
                            Normal Image
                          </div>
                        </div>
                      ) : item.hoverImage ? (
                        <div className="flex items-center gap-2">
                          <Image
                            src={item.hoverImage.url}
                            alt="Shows on hover"
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                          <div className="text-xs text-gray-500">
                            Hover Image
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No hover image
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
