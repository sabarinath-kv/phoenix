import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  File,
  Image as ImageIcon,
  Upload,
  X,
  ArrowLeft,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: "uploading" | "success" | "error";
  progress: number;
}

export const UploadPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to previous route
  };

  const handleFileSelect = (files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
      status: "uploading",
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach((uploadedFile) => {
      simulateUpload(uploadedFile.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId && file.status === "uploading") {
            const newProgress = Math.min(
              file.progress + Math.random() * 20 + 10,
              100
            );
            const newStatus = newProgress >= 100 ? "success" : file.status;
            return { ...file, progress: newProgress, status: newStatus };
          }
          return file;
        })
      );
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? { ...file, progress: 100, status: "success" }
            : file
        )
      );
    }, 2000 + Math.random() * 1500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/"))
      return <ImageIcon className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden safe-area-inset"
      style={{ backgroundColor: "#FFD934" }}
    >
      {/* Main container */}
      <div className="min-h-screen p-6 relative z-10">
        {/* Close/Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-12 w-12 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl rounded-full border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 micro-scale"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
        </div>

        {/* Header */}
        <div className="max-w-2xl mx-auto mb-8 mt-16">
          <div className="text-center space-y-3">
            <h1 className="text-h1 font-heading font-semibold text-gray-800">
              Upload Files
            </h1>
            <p className="text-body text-gray-700 max-w-md mx-auto font-medium">
              Drag and drop your files here, or click to browse and select files
              from your device
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Upload Zone */}
          <Card
            className={cn(
              "bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl",
              isDragOver &&
                "border-4 border-green-400 bg-green-50 scale-[1.02] shadow-2xl"
            )}
          >
            <CardContent className="p-8">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={openFileDialog}
                className="cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center space-y-4 text-center min-h-[200px]">
                  <div
                    className={cn(
                      "p-6 rounded-full transition-all duration-300",
                      isDragOver
                        ? "bg-green-100 text-green-600 scale-110"
                        : "bg-gradient-to-br from-yellow-100 to-green-100 text-green-700 hover:from-yellow-200 hover:to-green-200"
                    )}
                  >
                    <Upload className="h-12 w-12" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      {isDragOver
                        ? "Drop your files here"
                        : "Choose files to upload"}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      Supports images, documents, and other file types
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white border-0 py-3 px-8 text-base font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl micro-scale"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFileDialog();
                    }}
                  >
                    Browse Files
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileSelect(e.target.files);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-h2 font-heading font-bold text-gray-800">
                Uploaded Files ({uploadedFiles.length})
              </h2>

              <div className="space-y-3">
                {uploadedFiles.map((uploadedFile, index) => (
                  <Card
                    key={uploadedFile.id}
                    className="bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:border-green-300"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {/* File Preview/Icon */}
                        <div className="flex-shrink-0">
                          {uploadedFile.preview ? (
                            <img
                              src={uploadedFile.preview}
                              alt={uploadedFile.file.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center text-green-700">
                              {getFileIcon(uploadedFile.file)}
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-800 truncate">
                            {uploadedFile.file.name}
                          </h3>
                          <p className="text-xs text-gray-600 font-medium">
                            {formatFileSize(uploadedFile.file.size)}
                          </p>

                          {/* Progress Bar */}
                          {uploadedFile.status === "uploading" && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-yellow-400 to-green-400 h-2 rounded-full transition-all duration-500 ease-out will-change-transform"
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(100, uploadedFile.progress)
                                  )}%`,
                                  transform: `translateZ(0)`, // Force hardware acceleration
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                          {uploadedFile.status === "success" && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {uploadedFile.status === "error" && (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          {uploadedFile.status === "uploading" && (
                            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 h-8 w-8 hover:bg-red-100 hover:text-red-600 micro-scale rounded-full"
                          onClick={() => removeFile(uploadedFile.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white border-0 py-4 text-base font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl micro-scale"
                  disabled={uploadedFiles.some((f) => f.status === "uploading")}
                >
                  Continue
                </Button>
                <Button
                  size="lg"
                  className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 py-4 px-6 text-base font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl micro-scale"
                  onClick={() => {
                    uploadedFiles.forEach((f) => {
                      if (f.preview) URL.revokeObjectURL(f.preview);
                    });
                    setUploadedFiles([]);
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
