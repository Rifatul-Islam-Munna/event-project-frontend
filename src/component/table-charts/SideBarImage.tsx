import { Loader2, Upload, X } from "lucide-react";
import { useZoomResponive } from "@/zustan-fn/zoomResponive";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllImages, getVanuSize } from "@/actions/fetch-action";
import { pdfToImage } from "@/actions/profileInformation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { pdfToPng } from "@/lib/pdf";
import { usePathname } from "next/navigation";

export const ExtrasComponent = () => {
  const pathname = usePathname();
  const eventId = pathname.split("/").pop() as string;
  const { imageUrl, setImageUrl, clearImageUrl, isEditMode, hasImageOverride } =
    useZoomResponive(
    (state) => state,
  );

  const { data: images, isLoading: isImagesLoading } = useQuery({
    queryKey: ["images"],
    queryFn: () => getAllImages(),
  });
  const { data: venueLayout, isLoading: isVenueLoading } = useQuery({
    queryKey: ["vanu-size", eventId],
    queryFn: () => getVanuSize(eventId),
    enabled: Boolean(eventId),
  });

  const selectedLayoutUrl = hasImageOverride
    ? imageUrl
    : (venueLayout?.data?.background_image?.image_url ?? "");
  const isLoading = isImagesLoading || isVenueLoading;

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
    clearImageUrl();
    toast.success("Layout removed. Save venue changes to keep it.");
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
    <div className="mb-4 w-full rounded-lg bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-2">
        <h3 className="truncate text-left text-sm font-medium text-gray-900">
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
        {isLoading ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded" />
              ))}
            </div>
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : (
          <>
            <div className="max-h-32 overflow-y-auto overflow-x-hidden">
              <div className="grid grid-cols-3 gap-1">
                {images?.data?.map((url, index) => (
                  <div
                    key={index}
                    onClick={() => handleImageClick(url.imageUrl)}
                    className={`
                      relative aspect-square rounded overflow-hidden cursor-pointer border-2 transition-all
                      ${
                        selectedLayoutUrl === url.imageUrl
                          ? "border-blue-400"
                          : "border-transparent hover:border-gray-300"
                      }
                      ${!isEditMode ? "opacity-70" : ""}
                    `}
                  >
                    <img
                      src={url.imageUrl}
                      alt={`Extra ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {selectedLayoutUrl === url.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-400 bg-opacity-20">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      </div>
                    )}

                    {!isEditMode && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-30">
                        <div className="rounded bg-black bg-opacity-50 px-1 py-0.5 text-[10px] font-medium text-white">
                          Edit Off
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedLayoutUrl ? (
              <button
                onClick={handleClear}
                className={`
                  mt-2 flex w-full items-center justify-center py-1 text-xs transition-colors
                  ${
                    isEditMode
                      ? "text-gray-500 hover:text-gray-700"
                      : "cursor-not-allowed text-gray-400"
                  }
                `}
              >
                <X className="mr-1 h-3 w-3" />
                Remove layout
              </button>
            ) : null}
          </>
        )}

        <div className="mt-2 space-y-2">
          {selectedLayoutUrl ? (
            <div className="flex items-center justify-between rounded-lg border border-lime-200 bg-lime-50 px-2.5 py-2">
              <p className="truncate text-[11px] font-medium text-lime-900">
                Layout selected
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-7 w-7 shrink-0 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          {!isEditMode ? (
            <p className="truncate text-[10px] text-yellow-700">
              Turn on edit mode to upload
            </p>
          ) : null}

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
            <span className="truncate text-sm text-gray-700">
              {selectedLayoutUrl ? "Change layout" : "Upload layout"}
            </span>
          </Label>
        </div>
      </div>
    </div>
  );
};
