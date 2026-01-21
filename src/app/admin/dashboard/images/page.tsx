"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteImages, getAllImages, postImages } from "@/actions/fetch-action";

interface ImageData {
  id: string;
  url: string;
  name: string;
}

interface ImageManagerProps {
  onUpload?: (file: File) => Promise<ImageData>;
  onDelete?: (imageId: string) => Promise<void>;
  initialImages?: ImageData[];
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
}

export function ImageManager({
  onUpload,
  onDelete,
  initialImages = [],
  maxFileSize = 5,
  acceptedFileTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
}: ImageManagerProps) {
  const { data: images, refetch } = useQuery({
    queryKey: ["images"],
    queryFn: () => getAllImages(),
  });
  const { mutate, isPending } = useMutation({
    mutationKey: ["post-images"],
    mutationFn: (fdata: FormData) => postImages(fdata),
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Image uploaded successfully");
        refetch();
        return;
      }
      toast.error("Image uploaded failed");
    },
  });
  const { mutate: Delet, isPending: IsDeleteing } = useMutation({
    mutationKey: ["post-images"],
    mutationFn: (fdata: string) => deleteImages(fdata),
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Image Deleted successfully");
        refetch();
        return;
      }
      toast.error("Image deleted failed");
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedFileTypes.includes(file.type)) {
      return;
    }

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    mutate(formData);
  };

  // Handle image deletion
  const handleDelete = async (imageId: string) => {
    Delet(imageId);
  };

  // Reset selection
  const resetSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image-upload"
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFileTypes.join(",")}
                  onChange={handleFileSelect}
                  disabled={isPending}
                  className="flex-1"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Supported formats: {acceptedFileTypes.join(", ")} • Max size:{" "}
                {maxFileSize}MB
              </p>
            </div>

            {/* Preview Section */}
            {preview && (
              <div className="space-y-4">
                <div className="relative w-full max-w-xs mx-auto">
                  <div className="relative aspect-square rounded-lg overflow-hidden border">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    onClick={resetSelection}
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleUpload}
                    disabled={isPending || !selectedFile}
                    className="min-w-[120px]"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Save Image"
                    )}
                  </Button>
                  <Button
                    onClick={resetSelection}
                    variant="outline"
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      {(images?.data?.length ?? 0) > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Images</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {images?.data?.map((image) => (
              <div
                key={image._id}
                className="group relative aspect-square rounded-lg overflow-hidden border bg-muted hover:shadow-md transition-shadow"
              >
                <Image
                  src={image.imageUrl}
                  alt={"bg image"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />

                {/* Hover Delete Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    onClick={() => handleDelete(image._id)}
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(images?.data?.length ?? 0) === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}

// Example usage component
export default function ImageUploadPage() {
  // Mock upload function - replace with your actual upload logic
  const handleUpload = async (file: File): Promise<ImageData> => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In reality, you'd upload to your server/cloud storage
    const formData = new FormData();
    formData.append("file", file);

    return {
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file), // In production, this would be the server URL
      name: file.name,
    };
  };

  // Mock delete function - replace with your actual delete logic
  const handleDelete = async (imageId: string): Promise<void> => {
    // Simulate delete delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Example API call:
    // await fetch(`/api/images/${imageId}`, {
    //   method: 'DELETE'
    // })

    console.log(`Deleting image with ID: ${imageId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Image Manager</h1>
      <ImageManager
        onUpload={handleUpload}
        onDelete={handleDelete}
        maxFileSize={5}
        acceptedFileTypes={[
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
        ]}
      />
    </div>
  );
}
