"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner"; // or your toast library
import { postTemplateData } from "@/actions/profileInformation";

export function CreateTemplateDialog() {
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [links, setLinks] = useState("");

  const queryClient = useQueryClient();

  // Single mutation using your postTemplateData function
  const createTemplateMutation = useMutation({
    mutationFn: postTemplateData,
    onSuccess: (response) => {
      if (response.error) {
        toast.error(response.error.message || "Failed to create template");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template created successfully!");
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile || !title || !links) {
      toast.error("Please fill in all fields");
      return;
    }

    // Call mutation with your payload structure
    createTemplateMutation.mutate({
      imageUrl: imageFile, // Pass File object directly
      title,
      links,
    });
  };

  const handleClose = () => {
    setOpen(false);
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
    setTitle("");
    setLinks("");
  };

  const isLoading = createTemplateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-lime-600 hover:bg-lime-700 text-white">
          Create Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lime-700">
            Create New Template
          </DialogTitle>
          <DialogDescription>
            Upload an image and add template details. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Image Upload */}
            <div className="grid gap-2">
              <Label htmlFor="image" className="text-lime-800">
                Template Image
              </Label>

              {!imagePreview ? (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-lime-300 border-dashed rounded-lg cursor-pointer bg-lime-50 hover:bg-lime-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-lime-600" />
                      <p className="text-sm text-lime-600 font-medium">
                        Click to upload image
                      </p>
                      <p className="text-xs text-lime-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isLoading}
                    />
                  </label>
                </div>
              ) : (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-lime-300">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={isLoading}
                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Title Input */}
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-lime-800">
                Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter template title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                className="border-lime-300 focus:border-lime-500 focus:ring-lime-500"
              />
            </div>

            {/* Links Input */}
            <div className="grid gap-2">
              <Label htmlFor="links" className="text-lime-800">
                Links
              </Label>
              <Input
                id="links"
                type="text"
                placeholder="Enter template links"
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                disabled={isLoading}
                className="border-lime-300 focus:border-lime-500 focus:ring-lime-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-lime-300 text-lime-700 hover:bg-lime-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !imageFile || !title || !links}
              className="bg-lime-600 hover:bg-lime-700 text-white disabled:bg-lime-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
