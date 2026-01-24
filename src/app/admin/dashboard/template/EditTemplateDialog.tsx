"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Upload, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateTemplateData } from "@/actions/profileInformation";
import Image from "next/image";
interface Template {
  _id: string;
  imageUrl?: string;
  title?: string;
  links?: string;
}

interface EditTemplateDialogProps {
  template: Template;
}

export function EditTemplateDialog({ template }: EditTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [links, setLinks] = useState("");
  const [hasNewImage, setHasNewImage] = useState(false);

  const queryClient = useQueryClient();

  // Pre-fill form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle(template.title ?? "");
      setLinks(template.links ?? "");
      setImagePreview(template.imageUrl ?? "");
      setImageFile(null);
      setHasNewImage(false);
    }
  }, [open, template]);

  // Single mutation using your updateTemplateData function
  const updateTemplateMutation = useMutation({
    mutationFn: (payload: any) => updateTemplateData(payload),
    onSuccess: (response) => {
      if (response.error) {
        toast.error(response.error.message || "Failed to update template");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template updated successfully!");
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
      setHasNewImage(true);
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    if (hasNewImage && imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(template.imageUrl ?? "");
    setHasNewImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !links) {
      toast.error("Please fill in all fields");
      return;
    }

    // Build payload - only include imageUrl if new file uploaded
    const payload: any = {
      title,
      links,
      ...(hasNewImage && imageFile && { imageUrl: imageFile }),
      id: template._id,
    };

    updateTemplateMutation.mutate(payload);
  };

  const handleClose = () => {
    setOpen(false);
    setImageFile(null);
    if (hasNewImage && imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
    setTitle("");
    setLinks("");
    setHasNewImage(false);
  };

  const isLoading = updateTemplateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-lime-100 hover:text-lime-700 text-lime-600"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lime-700">Edit Template</DialogTitle>
          <DialogDescription>
            Update template details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Image Upload */}
            <div className="grid gap-2">
              <Label htmlFor="edit-image" className="text-lime-800">
                Template Image
              </Label>

              {!imagePreview ? (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="edit-image"
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
                      id="edit-image"
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
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    width={500}
                    height={500}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <label
                      htmlFor="edit-image"
                      className="p-2 bg-lime-600 hover:bg-lime-700 text-white rounded-full cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <Input
                        id="edit-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isLoading}
                      />
                    </label>
                    {hasNewImage && (
                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={isLoading}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {hasNewImage && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-lime-600 text-white text-xs rounded">
                      New image selected
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title Input */}
            <div className="grid gap-2">
              <Label htmlFor="edit-title" className="text-lime-800">
                Title
              </Label>
              <Input
                id="edit-title"
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
              <Label htmlFor="edit-links" className="text-lime-800">
                Links
              </Label>
              <Input
                id="edit-links"
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
              disabled={isLoading || !title || !links}
              className="bg-lime-600 hover:bg-lime-700 text-white disabled:bg-lime-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
