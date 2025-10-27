"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/lib/toast";

export function VideoUpload({
  value,
  onChange,
  label = "Upload Video",
  folder = "videos",
  className = "",
  disabled = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file) => {
    const validTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/mov",
      "video/avi",
    ];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(file.type)) {
      showError("Please select a valid video file (MP4, WebM, OGG, MOV, AVI)");
      return false;
    }

    if (file.size > maxSize) {
      showError("Video file must be less than 50MB");
      return false;
    }

    return true;
  };

  const uploadVideo = async (file) => {
    if (!validateFile(file)) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      const videoData = {
        url: result.data.secure_url,
        publicId: result.data.public_id,
        format: result.data.format,
        size: result.data.bytes,
        width: result.data.width,
        height: result.data.height,
      };

      onChange(videoData);
      showSuccess("Video uploaded successfully!");
    } catch (error) {
      console.error("Error uploading video:", error);
      showError("Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || uploading) return;

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        uploadVideo(files[0]);
      }
    },
    [disabled, uploading]
  );

  const handleChange = (e) => {
    e.preventDefault();
    if (disabled || uploading) return;

    const files = e.target.files;
    if (files && files[0]) {
      uploadVideo(files[0]);
    }
  };

  const removeVideo = () => {
    if (disabled) return;
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      )}

      <Card
        className={`relative overflow-hidden transition-all duration-200 ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <CardContent className="p-0">
          {value ? (
            <div className="relative group">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <video
                  src={value.url}
                  className="w-full h-full object-cover"
                  controls={false}
                  muted
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => {
                    e.target.pause();
                    e.target.currentTime = 0;
                  }}
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeVideo}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <div className="p-3 bg-gray-50 text-sm text-gray-600">
                <div>Duration: {Math.round(value.duration)}s</div>
                <div>Size: {(value.size / 1024 / 1024).toFixed(2)} MB</div>
                <div>Format: {value.format?.toUpperCase()}</div>
              </div>
            </div>
          ) : (
            <div
              className={`p-8 text-center ${
                disabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              {uploading ? (
                <div className="space-y-3">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                  <p className="text-sm text-gray-600">Uploading video...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP4, WebM, OGG, MOV, AVI (max 50MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/mov,video/avi"
        onChange={handleChange}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
}
