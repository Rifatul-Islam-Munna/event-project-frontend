"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { MutableRefObject } from "react";
import type Konva from "konva";
import {
  Stage,
  Layer,
  Circle,
  Line,
  Group,
  Image as KonvaImage,
} from "react-konva";
import { Edit3, Check } from "lucide-react";
import useImage from "use-image";
import { useZoomResponive } from "@/zustan-fn/zoomResponive";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getVanuSize, postVanuSize, updateEvent } from "@/actions/fetch-action";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Point {
  x: number;
  y: number;
}

interface PlannerViewport {
  x: number;
  y: number;
  zoom: number;
}

interface SmoothDraggableVenueShapeProps {
  venueWidth: number;
  venueHeight: number;
  SCALE_FACTOR: number;
  onShapeChange?: (points: Point[]) => void;
  venu_id: string;
  onDimensionsChange?: (width: number, height: number) => void; // NEW: callback for dimension changes
  viewport: PlannerViewport;
  exportStageRef?: MutableRefObject<Konva.Stage | null>;
}

interface VenueConfigDB {
  id?: string;
  venue_id: string;
  venue_dimensions: {
    width_meters: number;
    height_meters: number;
    scale_factor: number;
  };
  venue_shape: {
    vertices: Point[];
  };
  background_image: {
    image_url: string | null;
    position: {
      x: number;
      y: number;
    };
    dimensions: {
      width: number;
      height: number;
    };
  };
}

const SmoothDraggableVenueShape: React.FC<SmoothDraggableVenueShapeProps> = ({
  venueWidth: initialVenueWidth,
  venueHeight: initialVenueHeight,
  SCALE_FACTOR,
  onShapeChange,
  venu_id,
  onDimensionsChange,
  viewport,
  exportStageRef,
}) => {
  const { x, y, zoom } = viewport;
  const CANVAS_SCALE_MULTIPLIER = 5;
  const scaledZoom = zoom * CANVAS_SCALE_MULTIPLIER;
  const boundaryScale = SCALE_FACTOR * scaledZoom;

  // NEW: State for editable dimensions
  const [venueWidth, setVenueWidth] = useState(initialVenueWidth);
  const [venueHeight, setVenueHeight] = useState(initialVenueHeight);
  const [editableWidth, setEditableWidth] = useState(
    initialVenueWidth.toString(),
  );
  const [editableHeight, setEditableHeight] = useState(
    initialVenueHeight.toString(),
  );
  const [dimensionError, setDimensionError] = useState("");

  const [vertices, setVertices] = useState<Point[]>([
    { x: 0, y: 0 },
    { x: venueWidth, y: 0 },
    { x: venueWidth, y: venueHeight },
    { x: 0, y: venueHeight },
  ]);

  const { data } = useQuery({
    queryKey: ["vanu-size", venu_id],
    queryFn: () => getVanuSize(venu_id),
    enabled: !!venu_id,
  });

  const { isEditMode, setIsEditMode, imageUrl, hasImageOverride } = useZoomResponive(
    (state) => state,
  );

  const [imageState, setImageState] = useState({
    x: 0,
    y: 0,
    width: venueWidth * SCALE_FACTOR,
    height: venueHeight * SCALE_FACTOR,
  });
  const pathName = usePathname();
  const imageRef = useRef<Konva.Image | null>(null);
  const searchParams = useSearchParams();
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (hasImageOverride) {
      setActiveImageUrl(imageUrl || null);
      return;
    }

    setActiveImageUrl(data?.data?.background_image?.image_url ?? null);
  }, [data?.data?.background_image?.image_url, hasImageOverride, imageUrl]);

  const [image] = useImage(activeImageUrl || "");

  const scaledWidth = venueWidth * boundaryScale;
  const scaledHeight = venueHeight * boundaryScale;

  const padding = 30 * zoom;
  const boundaryX = x - padding;
  const boundaryY = y - padding;

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
    mutationFn: (data: VenueConfigDB) =>
      postVanuSize(data as unknown as Record<string, unknown>),
    onSuccess: (data) => {
      if (data.data) {
        toast.success("Venue configuration updated successfully");
        return;
      }
      toast.error("Venue configuration update failed");
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

  // NEW: Validate dimension inputs
  const validateDimensions = useCallback(
    (width: string, height: string): boolean => {
      const w = parseFloat(width);
      const h = parseFloat(height);

      if (isNaN(w) || isNaN(h)) {
        setDimensionError("Please enter valid numbers");
        return false;
      }

      if (w <= 0 || h <= 0) {
        setDimensionError("Dimensions must be greater than 0");
        return false;
      }

      if (w > 1000 || h > 1000) {
        setDimensionError("Dimensions too large (max 1000m)");
        return false;
      }

      setDimensionError("");
      return true;
    },
    [],
  );
  const { mutate: UpdateVanue } = useMutation({
    mutationKey: ["update-vanue"],
    mutationFn: (data: FormData) => updateEvent(data),
  });
  const router = useRouter();
  // NEW: Apply dimension changes
  const applyDimensionChanges = useCallback(() => {
    if (!validateDimensions(editableWidth, editableHeight)) {
      return;
    }

    const newWidth = parseFloat(editableWidth);
    const newHeight = parseFloat(editableHeight);

    setVenueWidth(newWidth);
    setVenueHeight(newHeight);

    // Update vertices to match new dimensions
    setVertices([
      { x: 0, y: 0 },
      { x: newWidth, y: 0 },
      { x: newWidth, y: newHeight },
      { x: 0, y: newHeight },
    ]);

    // Update image dimensions proportionally
    setImageState((prev) => ({
      ...prev,
      width: newWidth * SCALE_FACTOR,
      height: newHeight * SCALE_FACTOR,
    }));

    // Notify parent component
    onDimensionsChange?.(newWidth, newHeight);
    const fromData = new FormData();
    fromData.append("width", newWidth.toString());
    fromData.append("height", newHeight.toString());
    fromData.append("id", pathName.split("/")[3]);

    UpdateVanue(fromData);
    const currentParams = new URLSearchParams(
      Array.from(searchParams.entries()),
    );
    currentParams.set("venueWidth", newWidth.toString());
    currentParams.set("venueHeight", newHeight.toString());

    // Update URL without page reload or scroll
    router.replace(`${pathName}?${currentParams.toString()}`, {
      scroll: false,
    });
    toast.success(`Venue dimensions updated: ${newWidth}m x ${newHeight}m`);
  }, [
    editableWidth,
    editableHeight,
    validateDimensions,
    SCALE_FACTOR,
    onDimensionsChange,
    UpdateVanue,
    pathName,
    router,
    searchParams,
  ]);

  // NEW: Handle edit mode toggle
  const toggleEditMode = useCallback(() => {
    if (isEditMode) {
      // Exiting edit mode - reset editable values to current dimensions
      setEditableWidth(venueWidth.toString());
      setEditableHeight(venueHeight.toString());
      setDimensionError("");
    }
    setIsEditMode(!isEditMode);
  }, [isEditMode, venueWidth, venueHeight, setIsEditMode]);

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
        image_url: hasImageOverride
          ? imageUrl || null
          : (data?.data?.background_image?.image_url ?? activeImageUrl ?? null),
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
      JSON.stringify(venueConfig, null, 2),
    );
    return venueConfig;
  }, [
    venu_id,
    venueWidth,
    venueHeight,
    SCALE_FACTOR,
    vertices,
    activeImageUrl,
    hasImageOverride,
    imageUrl,
    data?.data?._id,
    data?.data?.background_image?.image_url,
    imageState.x,
    imageState.y,
    imageState.width,
    imageState.height,
    mutate,
  ]);

  const loadVenueConfiguration = useCallback(
    (dbConfig: VenueConfigDB) => {
      console.log("🔄 LOADING OPTIMIZED CONFIG:", dbConfig);

      // Load dimensions
      setVenueWidth(dbConfig?.venue_dimensions?.width_meters);
      setVenueHeight(dbConfig?.venue_dimensions?.height_meters);
      setEditableWidth(dbConfig?.venue_dimensions?.width_meters.toString());
      setEditableHeight(dbConfig?.venue_dimensions?.height_meters.toString());

      setVertices(dbConfig?.venue_shape?.vertices);

      setImageState({
        x: dbConfig?.background_image?.position?.x,
        y: dbConfig?.background_image?.position?.y,
        width: dbConfig?.background_image?.dimensions?.width,
        height: dbConfig?.background_image?.dimensions?.height,
      });

      setIsEditMode(false);

      if (onShapeChange) {
        onShapeChange(dbConfig?.venue_shape?.vertices);
      }

      console.log("✅ OPTIMIZED CONFIG LOADED");
    },
    [onShapeChange, setIsEditMode],
  );

  useEffect(() => {
    if (data?.data && data?.data !== null) {
      const dbConfig = data?.data;
      loadVenueConfiguration(dbConfig);
    }
  }, [data, loadVenueConfiguration]);

  const generateBorderPath = () => {
    const points: number[] = [];
    vertices?.forEach((v) => {
      points.push(
        v.x * boundaryScale + padding,
        v.y * boundaryScale + padding,
      );
    });
    points?.push(
      vertices[0].x * boundaryScale + padding,
      vertices[0].y * boundaryScale + padding,
    );
    return points;
  };

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
          imageState.x + imageState.width - (newX - padding) / scaledZoom,
        );
        newHeight = Math.max(
          minSize,
          imageState.y + imageState.height - (newY - padding) / scaledZoom,
        );
        newImageX = (newX - padding) / scaledZoom;
        newImageY = (newY - padding) / scaledZoom;
        break;
      case "top-right":
        newWidth =
          Math.max(minSize, newX - padding - imageState.x * scaledZoom) /
          scaledZoom;
        newHeight = Math.max(
          minSize,
          imageState.y + imageState.height - (newY - padding) / scaledZoom,
        );
        newImageY = (newY - padding) / scaledZoom;
        break;
      case "bottom-left":
        newWidth = Math.max(
          minSize,
          imageState.x + imageState.width - (newX - padding) / scaledZoom,
        );
        newHeight =
          Math.max(minSize, newY - padding - imageState.y * scaledZoom) /
          scaledZoom;
        newImageX = (newX - padding) / scaledZoom;
        break;
      case "bottom-right":
        newWidth =
          Math.max(minSize, newX - padding - imageState.x * scaledZoom) /
          scaledZoom;
        newHeight =
          Math.max(minSize, newY - padding - imageState.y * scaledZoom) /
          scaledZoom;
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
          zIndex: 6,
        }}
        ref={(node) => {
          if (exportStageRef) {
            exportStageRef.current = node;
          }
        }}
      >
        <Layer>
          <Group>
            {image && (
              <KonvaImage
                ref={imageRef}
                image={image}
                x={padding + imageState.x * scaledZoom}
                y={padding + imageState.y * scaledZoom}
                width={imageState.width * scaledZoom}
                height={imageState.height * scaledZoom}
                draggable={isEditMode}
                opacity={0.15} // if need we will change the opacity
                listening={isEditMode}
                onDragMove={(e) => {
                  if (isEditMode) {
                    setImageState((prev) => ({
                      ...prev,
                      x: (e.target.x() - padding) / scaledZoom,
                      y: (e.target.y() - padding) / scaledZoom,
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

            <Line
              points={generateBorderPath()}
              stroke="#84cc16"
              strokeWidth={Math.max(2, 3 * zoom)}
              dash={[Math.max(8, 12 * zoom), Math.max(4, 6 * zoom)]}
              closed={false}
              opacity={isEditMode ? 1 : 0.92}
              listening={false}
            />

            {isEditMode &&
              vertices.map((v, i) => (
                <Circle
                  key={i}
                  x={v.x * boundaryScale + padding}
                  y={v.y * boundaryScale + padding}
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
                        (e.target.x() - padding) / boundaryScale,
                      ),
                    );
                    const newY = Math.max(
                      0,
                      Math.min(
                        venueHeight,
                        (e.target.y() - padding) / boundaryScale,
                      ),
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

            {isEditMode && image && imageState.width > 0 && (
              <>
                <Circle
                  x={padding + imageState.x * scaledZoom}
                  y={padding + imageState.y * scaledZoom}
                  radius={Math.max(8, 10 * zoom)}
                  fill="#c9c736"
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

                <Circle
                  x={padding + (imageState.x + imageState.width) * scaledZoom}
                  y={padding + imageState.y * scaledZoom}
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

                <Circle
                  x={padding + imageState.x * scaledZoom}
                  y={padding + (imageState.y + imageState.height) * scaledZoom}
                  radius={Math.max(8, 10 * zoom)}
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth={3}
                  draggable
                  onDragMove={(e) => {
                    handleImageResize(
                      "bottom-left",
                      e.target.x(),
                      e.target.y(),
                    );
                  }}
                  onMouseEnter={(e) => {
                    e.target.getStage()!.container().style.cursor = "sw-resize";
                  }}
                  onMouseLeave={(e) => {
                    e.target.getStage()!.container().style.cursor = "default";
                  }}
                />

                <Circle
                  x={padding + (imageState.x + imageState.width) * scaledZoom}
                  y={padding + (imageState.y + imageState.height) * scaledZoom}
                  radius={Math.max(8, 10 * zoom)}
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth={3}
                  draggable
                  onDragMove={(e) => {
                    handleImageResize(
                      "bottom-right",
                      e.target.x(),
                      e.target.y(),
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

      {/* NEW: Enhanced Venue Label with Editable Dimensions */}
      <div
        className="absolute bg-white/90 px-3 py-2 rounded-lg shadow-sm border flex items-center gap-3"
        style={{
          left: `${x}px`,
          top: `${y - 70 * zoom}px`,
          transform: `scale(${Math.max(0.8, zoom)})`,
          transformOrigin: "left top",
          zIndex: 9,
        }}
      >
        {isEditMode ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Venue:
              </span>
              <input
                type="number"
                value={editableWidth}
                onChange={(e) => setEditableWidth(e.target.value)}
                onBlur={() => validateDimensions(editableWidth, editableHeight)}
                className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-lime-500"
                placeholder="Width"
                step="0.1"
                min="0.1"
              />
              <span className="text-sm text-slate-600">x</span>
              <input
                type="number"
                value={editableHeight}
                onChange={(e) => setEditableHeight(e.target.value)}
                onBlur={() => validateDimensions(editableWidth, editableHeight)}
                className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-lime-500"
                placeholder="Height"
                step="0.1"
                min="0.1"
              />
              <span className="text-sm text-slate-600">m</span>

              {/* Tick/Check button to apply dimension changes */}
              <button
                onClick={applyDimensionChanges}
                disabled={!!dimensionError}
                className={`
                  flex items-center justify-center p-1 rounded transition-all
                  ${
                    dimensionError
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }
                `}
                title="Apply dimension changes"
              >
                <Check size={16} />
              </button>
            </div>
          </>
        ) : (
          <span className="text-sm font-semibold text-slate-700">
            Venue: {venueWidth}m x {venueHeight}m
          </span>
        )}

        <button
          onClick={toggleEditMode}
          className={`
            flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all
            ${
              isEditMode
                ? "bg-lime-800 hover:bg-lime-900 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }
          `}
        >
          <Edit3 size={12} />
          {isEditMode ? "Done" : "Edit"}
        </button>

        <button
          onClick={() => saveVenueConfiguration()}
          disabled={IsUpdateing}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-lime-800 hover:bg-lime-900 text-white disabled:bg-gray-400"
        >
          {IsUpdateing ? "Saving..." : "Save"}
        </button>

        {/* Error message display */}
        {dimensionError && isEditMode && (
          <span className="text-xs text-red-500 font-medium">
            {dimensionError}
          </span>
        )}
      </div>
    </>
  );
};

export default SmoothDraggableVenueShape;
export type { VenueConfigDB };
