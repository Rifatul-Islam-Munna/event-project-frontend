import { useEffect, useLayoutEffect, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import table from "./table.jpg";
import { useZoomResponive } from "@/zustan-fn/zoomResponive";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllImages } from "@/actions/fetch-action";
import { pdfToImage } from "@/actions/profileInformation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { pdfToPng } from "@/lib/pdf";

export const ExtrasComponent = () => {
  // Add more images for demonstration - you can replace with your actual images

  const { imageUrl, setImageUrl, isEditMode } = useZoomResponive(
    (state) => state,
  );

  const { data: images, refetch } = useQuery({
    queryKey: ["images"],
    queryFn: () => getAllImages(),
  });

  const handleImageClick = (url: string) => {
    if (!isEditMode) {
      toast.error("Please turn on edit mode first");
      return;
    }
    setImageUrl(url);
  };

  const handleClear = () => {
    if (!isEditMode) {
      toast.error("Please turn on edit mode first");
      return;
    }
    setImageUrl("");
  };

  const { mutate: uploadPdf, isPending: isPdfPending } = useMutation({
    mutationKey: ["upload-pdf"],
    mutationFn: (file: File) => pdfToImage(file),
    onSuccess: (data) => {
      if (data.data) {
        setImageUrl(data.data as string);
        return;
      }
      return toast.error(data?.error?.message);
    },
  });
  const handelPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      const readyPngFile = await pdfToPng(file);
      uploadPdf(readyPngFile);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg   mb-4">
      {/* Header */}
      <div className="p-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 text-left">
          Layout Template{" "}
          <span
            className={cn(" text-[10px] text-red-300", {
              hidden: isEditMode,
            })}
          >
            (turn on edit mode to see images)
          </span>
        </h3>
      </div>

      {/* Scrollable Images Grid */}
      <div className="p-2">
        <div className="max-h-32 overflow-y-auto overflow-x-hidden">
          {/* Grid container - 3 columns */}
          <div className="grid grid-cols-3 gap-1">
            {images?.data?.map((url, index) => (
              <div
                key={index}
                onClick={() => handleImageClick(url.imageUrl)}
                className={`
                  relative aspect-square rounded overflow-hidden cursor-pointer border-2 transition-all
                  ${
                    imageUrl === url.imageUrl
                      ? "border-blue-400"
                      : "border-transparent hover:border-gray-300"
                  }
                  ${!isEditMode ? "opacity-70" : ""}
                `}
              >
                <img
                  src={url.imageUrl}
                  alt={`Extra ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Selection indicator */}
                {imageUrl === url.imageUrl && (
                  <div className="absolute inset-0 bg-blue-400 bg-opacity-20 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}

                {/* Edit mode indicator */}
                {!isEditMode && (
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center">
                    <div className="text-[10px] text-white font-medium px-1 py-0.5 bg-black bg-opacity-50 rounded">
                      Edit Off
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Clear selection button if something is selected */}
        {imageUrl && (
          <button
            onClick={handleClear}
            className={`
              mt-2 w-full flex items-center justify-center py-1 text-xs transition-colors
              ${
                isEditMode
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-gray-400 cursor-not-allowed"
              }
            `}
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </button>
        )}

        <div className=" mt-2">
          <p className=" text-sm">
            Or Upload Your Layout (pdf only){" "}
            <span className=" text-yellow-700">
              {!isEditMode && "(turn on edit mode to upload)"}
            </span>
          </p>
          {imageUrl && (
            <div className="flex items-center gap-3 p-3 bg-lime-50 border border-lime-300 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-lime-900 truncate">
                  {imageUrl}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setImageUrl("")}
                className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Upload Button */}
          <input
            id="pdffile"
            type="file"
            accept="application/pdf"
            onChange={handelPdfUpload}
            className="hidden"
            disabled={isPdfPending || !isEditMode}
          />
          <Label
            htmlFor="pdffile"
            className={cn(
              `flex items-center justify-center gap-2 h-10 px-4 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-lime-600 hover:bg-lime-50 transition-colors`,
              {
                "cursor-not-allowed": isPdfPending || !isEditMode,
              },
            )}
            disabled={isPdfPending || !isEditMode}
          >
            {isPdfPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
            ) : (
              <Upload className="h-4 w-4 text-gray-600" />
            )}
            <span className="text-sm text-gray-700">
              {imageUrl ? "Change Logo" : "Upload layout"}
            </span>
          </Label>
        </div>
      </div>
    </div>
  );
};
