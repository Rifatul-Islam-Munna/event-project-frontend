"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Circle,
  Line,
  Group,
  Image as KonvaImage,
} from "react-konva";
import { useViewport } from "reactflow";
import { Edit3 } from "lucide-react";
import useImage from "use-image";
import { useZoomResponive } from "@/zustan-fn/zoomResponive";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getVanuSize, postVanuSize } from "@/actions/fetch-action";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

interface Point {
  x: number;
  y: number;
}

interface SmoothDraggableVenueShapeProps {
  venueWidth: number; // meters
  venueHeight: number; // meters
  SCALE_FACTOR: number; // px per meter
  onShapeChange?: (points: Point[]) => void;
  venueImage?: string; // Add image prop - can be from Zustand state
  venu_id: string;
}

// Predefined structure for database storage
interface VenueConfigDB {
  id?: string;
  venue_id: string;
  venue_dimensions: {
    width_meters: number;
    height_meters: number;
    scale_factor: number;
  };
  venue_shape: {
    vertices: Point[]; // This changes when user drags vertices
  };
  background_image: {
    image_url: string | null; // This changes when user selects different image
    position: {
      x: number; // This changes when user drags image
      y: number; // This changes when user drags image
    };
    dimensions: {
      width: number; // This changes when user resizes image
      height: number; // This changes when user resizes image
    };
  };
}

const SmoothDraggableVenueShape: React.FC<SmoothDraggableVenueShapeProps> = ({
  venueWidth,
  venueHeight,
  SCALE_FACTOR,
  onShapeChange,
  venueImage,
  venu_id,
}) => {
  const { x, y, zoom } = useViewport();

  const [vertices, setVertices] = useState<Point[]>([
    { x: 0, y: 0 },
    { x: venueWidth, y: 0 },
    { x: venueWidth, y: venueHeight },
    { x: 0, y: venueHeight },
  ]);

  const { data, isPending } = useQuery({
    queryKey: ["vanu-size", venu_id],
    queryFn: () => getVanuSize(venu_id),
    enabled: !!venu_id,
  });

  const { isEditMode, setIsEditMode, imageUrl, setImageUrl } = useZoomResponive(
    (state) => state
  );

  // Image state for position and scale
  const [imageState, setImageState] = useState({
    x: 0,
    y: 0,
    width: venueWidth * SCALE_FACTOR,
    height: venueHeight * SCALE_FACTOR,
  });

  const stageRef = useRef<any>(null);
  const imageRef = useRef<any>(null);

  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  // Load DB image first when data comes in
  useEffect(() => {
    if (data?.data?.background_image?.image_url) {
      setActiveImageUrl(data.data.background_image.image_url);
    }
  }, [data]);

  // If Zustand's imageUrl changes (user selected a new image), prefer that
  useEffect(() => {
    if (imageUrl) {
      setActiveImageUrl(imageUrl);
    }
  }, [imageUrl]);

  // Use the merged "active image" as the source
  const [image] = useImage(activeImageUrl || "");

  const scaledWidth = venueWidth * SCALE_FACTOR * zoom * 7;
  const scaledHeight = venueHeight * SCALE_FACTOR * zoom * 7;

  // Add padding around the whole stage
  const padding = 30 * zoom;
  const boundaryX = x - padding;
  const boundaryY = y - padding;

  // Initialize image dimensions when image loads
  React.useEffect(() => {
    if (image && imageState.width === 0) {
      setImageState((prev) => ({
        ...prev,
        width: scaledWidth,
        height: scaledHeight,
      }));
    }
  }, [image, scaledWidth, scaledHeight, imageState.width]);
  const { mutate, isPending: IsUpdateing } = useMutation({
    mutationKey: ["venue-config", venu_id],
    mutationFn: (data: Record<string, unknown>) => postVanuSize(data),
    onSuccess: (data) => {
      if (data.data) {
        toast.success("Venue Size updated successfully");
        return;
      }
      toast.error("Venue Size updated Fail");
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

  // Save venue configuration to database format
  const saveVenueConfiguration = useCallback(() => {
    const venueConfig: VenueConfigDB = {
      venue_id: venu_id,
      venue_dimensions: {
        width_meters: venueWidth,
        height_meters: venueHeight,
        scale_factor: SCALE_FACTOR,
      },
      venue_shape: {
        vertices: vertices,
      },
      background_image: {
        image_url:
          activeImageUrl || data?.data?.background_image?.image_url || null,
        position: {
          x: imageState.x,
          y: imageState.y,
        },
        dimensions: {
          width: imageState.width,
          height: imageState.height,
        },
      },
      ...(data?.data?._id && { id: data?.data?._id }),
    };
    mutate(venueConfig);

    console.log(
      "🎯 OPTIMIZED VENUE CONFIG:",
      JSON.stringify(venueConfig, null, 2)
    );
    return venueConfig;
  }, [
    venu_id,
    venueWidth,
    venueHeight,
    SCALE_FACTOR,
    vertices,
    activeImageUrl,
    data?.data?.background_image?.image_url,
    data?.data?._id,
    imageState.x,
    imageState.y,
    imageState.width,
    imageState.height,
    mutate,
  ]);

  // Load venue configuration from database format
  const loadVenueConfiguration = useCallback(
    (dbConfig: VenueConfigDB) => {
      console.log("🔄 LOADING OPTIMIZED CONFIG:", dbConfig);

      // Load only the dynamic data
      setVertices(dbConfig?.venue_shape?.vertices);

      setImageState({
        x: dbConfig?.background_image?.position?.x,
        y: dbConfig?.background_image?.position?.y,
        width: dbConfig?.background_image?.dimensions?.width,
        height: dbConfig?.background_image?.dimensions?.height,
      });

      // Edit mode is always false on load (user decides when to edit)
      setIsEditMode(false);

      if (onShapeChange) {
        onShapeChange(dbConfig?.venue_shape?.vertices);
      }

      console.log("✅ OPTIMIZED CONFIG LOADED");
    },
    [onShapeChange, setIsEditMode]
  );
  useEffect(() => {
    if (data?.data && data?.data !== null) {
      const dbConfig = data?.data;
      loadVenueConfiguration(dbConfig);
      /* setVertices(dbConfig?.venue_shape?.vertices);
      setImageState({
        x: dbConfig?.background_image?.position?.x,
        y: dbConfig?.background_image?.position?.y,
        width: dbConfig?.background_image?.dimensions?.width,
        height: dbConfig?.background_image?.dimensions?.height,
      }); */
    }
  }, [data]);

  const generateBorderPath = () => {
    const points: number[] = [];
    vertices?.forEach((v) => {
      points.push(
        v.x * SCALE_FACTOR * zoom * 7 + padding,
        v.y * SCALE_FACTOR * zoom * 7 + padding
      );
    });
    // Close the shape
    points?.push(
      vertices[0].x * SCALE_FACTOR * zoom * 7 + padding,
      vertices[0].y * SCALE_FACTOR * zoom * 7 + padding
    );
    return points;
  };

  // Handle image resize from corners
  const handleImageResize = (corner: string, newX: number, newY: number) => {
    const minSize = 50;
    let newWidth = imageState.width;
    let newHeight = imageState.height;
    let newImageX = imageState.x;
    let newImageY = imageState.y;

    switch (corner) {
      case "top-left":
        newWidth = Math.max(
          minSize,
          imageState.x + imageState.width - (newX - padding) / (zoom * 7)
        );
        newHeight = Math.max(
          minSize,
          imageState.y + imageState.height - (newY - padding) / (zoom * 7)
        );
        newImageX = (newX - padding) / (zoom * 7);
        newImageY = (newY - padding) / (zoom * 7);
        break;
      case "top-right":
        newWidth =
          Math.max(minSize, newX - padding - imageState.x) / (zoom * 7);
        newHeight = Math.max(
          minSize,
          imageState.y + imageState.height - (newY - padding) / (zoom * 7)
        );
        newImageY = (newY - padding) / (zoom * 7);
        break;
      case "bottom-left":
        newWidth = Math.max(
          minSize,
          imageState.x + imageState.width - (newX - padding) / (zoom * 7)
        );
        newHeight =
          Math.max(minSize, newY - padding - imageState.y) / (zoom * 7);
        newImageX = (newX - padding) / (zoom * 7);
        break;
      case "bottom-right":
        newWidth =
          Math.max(minSize, newX - padding - imageState.x) / (zoom * 7);
        newHeight =
          Math.max(minSize, newY - padding - imageState.y) / (zoom * 7);
        break;
    }

    setImageState({
      x: newImageX,
      y: newImageY,
      width: newWidth,
      height: newHeight,
    });
  };

  return (
    <>
      {/* Dynamic Border with Image */}
      <Stage
        width={scaledWidth + padding * 2}
        height={scaledHeight + padding * 2}
        style={{
          position: "absolute",
          left: `${boundaryX}px`,
          top: `${boundaryY}px`,
          pointerEvents: isEditMode ? "auto" : "none",
          zIndex: 10,
        }}
        ref={stageRef}
      >
        <Layer>
          <Group>
            {/* Background Image - Very low opacity so tables are fully visible */}
            {image && (
              <KonvaImage
                ref={imageRef}
                image={image}
                x={padding + imageState.x * zoom * 7}
                y={padding + imageState.y * zoom * 7}
                width={imageState.width * zoom * 7}
                height={imageState.height * zoom * 7}
                draggable={isEditMode}
                opacity={0.15} // Very low opacity - pure background
                listening={isEditMode}
                onDragMove={(e) => {
                  if (isEditMode) {
                    setImageState((prev) => ({
                      ...prev,
                      x: e.target.x() - padding,
                      y: e.target.y() - padding,
                    }));
                  }
                }}
                onMouseEnter={(e) => {
                  if (isEditMode) {
                    e.target.getStage()!.container().style.cursor = "move";
                  }
                }}
                onMouseLeave={(e) => {
                  if (isEditMode) {
                    e.target.getStage()!.container().style.cursor = "default";
                  }
                }}
              />
            )}

            {/* Dynamic Border Line */}
            <Line
              points={generateBorderPath()}
              stroke="#1d4ed8"
              strokeWidth={Math.max(2, 3 * zoom)}
              dash={[Math.max(8, 12 * zoom), Math.max(4, 6 * zoom)]}
              closed={false}
              listening={false}
            />

            {/* Edit Mode: Show draggable vertices */}
            {isEditMode &&
              vertices.map((v, i) => (
                <Circle
                  key={i}
                  x={v.x * SCALE_FACTOR * zoom * 7 + padding}
                  y={v.y * SCALE_FACTOR * zoom * 7 + padding}
                  radius={Math.max(8, 12 * zoom)}
                  fill="white"
                  stroke="#3b82f6"
                  strokeWidth={Math.max(2, 3 * zoom)}
                  draggable
                  onDragMove={(e) => {
                    const newX = Math.max(
                      0,
                      Math.min(
                        venueWidth,
                        (e.target.x() - padding) / (SCALE_FACTOR * zoom * 7)
                      )
                    );
                    const newY = Math.max(
                      0,
                      Math.min(
                        venueHeight,
                        (e.target.y() - padding) / (SCALE_FACTOR * zoom * 7)
                      )
                    );

                    const newV = [...vertices];
                    newV[i] = { x: newX, y: newY };
                    setVertices(newV);
                    onShapeChange?.(newV);
                  }}
                  onMouseEnter={(e) => {
                    e.target.getStage()!.container().style.cursor = "grab";
                  }}
                  onMouseLeave={(e) => {
                    e.target.getStage()!.container().style.cursor = "default";
                  }}
                  onDragStart={(e) => {
                    e.target.getStage()!.container().style.cursor = "grabbing";
                  }}
                  onDragEnd={(e) => {
                    e.target.getStage()!.container().style.cursor = "default";
                  }}
                />
              ))}

            {/* 4 Corner resize handles - only in edit mode */}
            {isEditMode && image && imageState.width > 0 && (
              <>
                {/* Top-left resize handle */}
                <Circle
                  x={padding + imageState.x * zoom * 7}
                  y={padding + imageState.y * zoom * 7}
                  radius={Math.max(8, 10 * zoom)}
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth={3}
                  draggable
                  onDragMove={(e) => {
                    handleImageResize("top-left", e.target.x(), e.target.y());
                  }}
                  onMouseEnter={(e) => {
                    e.target.getStage()!.container().style.cursor = "nw-resize";
                  }}
                  onMouseLeave={(e) => {
                    e.target.getStage()!.container().style.cursor = "default";
                  }}
                />

                {/* Top-right resize handle */}
                <Circle
                  x={padding + (imageState.x + imageState.width) * zoom * 7}
                  y={padding + imageState.y * zoom * 7}
                  radius={Math.max(8, 10 * zoom)}
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth={3}
                  draggable
                  onDragMove={(e) => {
                    handleImageResize("top-right", e.target.x(), e.target.y());
                  }}
                  onMouseEnter={(e) => {
                    e.target.getStage()!.container().style.cursor = "ne-resize";
                  }}
                  onMouseLeave={(e) => {
                    e.target.getStage()!.container().style.cursor = "default";
                  }}
                />

                {/* Bottom-left resize handle */}
                <Circle
                  x={padding + imageState.x * zoom * 7}
                  y={padding + (imageState.y + imageState.height) * zoom * 7}
                  radius={Math.max(8, 10 * zoom)}
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth={3}
                  draggable
                  onDragMove={(e) => {
                    handleImageResize(
                      "bottom-left",
                      e.target.x(),
                      e.target.y()
                    );
                  }}
                  onMouseEnter={(e) => {
                    e.target.getStage()!.container().style.cursor = "sw-resize";
                  }}
                  onMouseLeave={(e) => {
                    e.target.getStage()!.container().style.cursor = "default";
                  }}
                />

                {/* Bottom-right resize handle */}
                <Circle
                  x={padding + (imageState.x + imageState.width) * zoom * 7}
                  y={padding + (imageState.y + imageState.height) * zoom * 7}
                  radius={Math.max(8, 10 * zoom)}
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth={3}
                  draggable
                  onDragMove={(e) => {
                    handleImageResize(
                      "bottom-right",
                      e.target.x(),
                      e.target.y()
                    );
                  }}
                  onMouseEnter={(e) => {
                    e.target.getStage()!.container().style.cursor = "se-resize";
                  }}
                  onMouseLeave={(e) => {
                    e.target.getStage()!.container().style.cursor = "default";
                  }}
                />
              </>
            )}
          </Group>
        </Layer>
      </Stage>

      {/* Venue Label with Edit Mode Button */}
      <div
        className="absolute bg-white/90 px-3 py-2 rounded-lg shadow-sm border flex items-center gap-3"
        style={{
          left: `${x}px`,
          top: `${y - 70 * zoom}px`,
          transform: `scale(${Math.max(0.8, zoom)})`,
          transformOrigin: "left top",
          zIndex: 50,
        }}
      >
        <span className="text-sm font-semibold text-slate-700">
          Venue: {venueWidth}m × {venueHeight}m
        </span>

        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`
            flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all
            ${
              isEditMode
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }
          `}
        >
          <Edit3 size={12} />
          {isEditMode ? "Done" : "Edit"}
        </button>

        {/* Manual Save Button for Testing */}
        <button
          onClick={() => saveVenueConfiguration()}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-500 hover:bg-green-600 text-white"
        >
          Save
        </button>
      </div>

      {/* Corner markers - only show when not in edit mode */}
      {!isEditMode && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
        >
          <div
            className="absolute border-l-2 border-t-2 border-slate-400"
            style={{
              top: `${15 * zoom}px`,
              left: `${15 * zoom}px`,
              width: `${8 * zoom}px`,
              height: `${8 * zoom}px`,
            }}
          />
          <div
            className="absolute border-r-2 border-t-2 border-slate-400"
            style={{
              top: `${15 * zoom}px`,
              right: `${15 * zoom}px`,
              width: `${8 * zoom}px`,
              height: `${8 * zoom}px`,
            }}
          />
          <div
            className="absolute border-l-2 border-b-2 border-slate-400"
            style={{
              bottom: `${15 * zoom}px`,
              left: `${15 * zoom}px`,
              width: `${8 * zoom}px`,
              height: `${8 * zoom}px`,
            }}
          />
          <div
            className="absolute border-r-2 border-b-2 border-slate-400"
            style={{
              bottom: `${15 * zoom}px`,
              right: `${15 * zoom}px`,
              width: `${8 * zoom}px`,
              height: `${8 * zoom}px`,
            }}
          />
        </div>
      )}
    </>
  );
};

// Export both the component and the interface for use in parent components
export default SmoothDraggableVenueShape;
export type { VenueConfigDB };
