import { useEffect, useLayoutEffect, useState } from "react";
import { X } from "lucide-react";
import table from "./table.jpg";
import { useZoomResponive } from "@/zustan-fn/zoomResponive";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getAllImages } from "@/actions/fetch-action";

export const ExtrasComponent = () => {
  // Add more images for demonstration - you can replace with your actual images

  const { imageUrl, setImageUrl, isEditMode } = useZoomResponive(
    (state) => state
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

  return (
    <div className="w-full bg-white rounded-lg   mb-4">
      {/* Header */}
      <div className="p-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 text-left">
          Extras{" "}
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
      </div>
    </div>
  );
};
