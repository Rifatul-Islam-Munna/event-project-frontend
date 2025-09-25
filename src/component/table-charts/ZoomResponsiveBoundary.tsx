"use client";

import React, { useState, useCallback, useRef } from "react";
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
}

const SmoothDraggableVenueShape: React.FC<SmoothDraggableVenueShapeProps> = ({
  venueWidth,
  venueHeight,
  SCALE_FACTOR,
  onShapeChange,
  venueImage,
}) => {
  const { x, y, zoom } = useViewport();

  const [vertices, setVertices] = useState<Point[]>([
    { x: 0, y: 0 },
    { x: venueWidth, y: 0 },
    { x: venueWidth, y: venueHeight },
    { x: 0, y: venueHeight },
  ]);

  const [isEditMode, setIsEditMode] = useState(false);

  // Image state for position and scale
  const [imageState, setImageState] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const stageRef = useRef<any>(null);
  const imageRef = useRef<any>(null);

  // Load the image using use-image hook
  const [image] = useImage(
    venueImage ||
      "http://localhost:9000/my-public-bucket/1756813541744-189169006.jpeg"
  );

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

  // Generate border path points based on current vertices
  const generateBorderPath = () => {
    const points: number[] = [];
    vertices.forEach((v) => {
      points.push(
        v.x * SCALE_FACTOR * zoom * 7 + padding,
        v.y * SCALE_FACTOR * zoom * 7 + padding
      );
    });
    // Close the shape
    points.push(
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
          imageState.x + imageState.width - (newX - padding)
        );
        newHeight = Math.max(
          minSize,
          imageState.y + imageState.height - (newY - padding)
        );
        newImageX = newX - padding;
        newImageY = newY - padding;
        break;
      case "top-right":
        newWidth = Math.max(minSize, newX - padding - imageState.x);
        newHeight = Math.max(
          minSize,
          imageState.y + imageState.height - (newY - padding)
        );
        newImageY = newY - padding;
        break;
      case "bottom-left":
        newWidth = Math.max(
          minSize,
          imageState.x + imageState.width - (newX - padding)
        );
        newHeight = Math.max(minSize, newY - padding - imageState.y);
        newImageX = newX - padding;
        break;
      case "bottom-right":
        newWidth = Math.max(minSize, newX - padding - imageState.x);
        newHeight = Math.max(minSize, newY - padding - imageState.y);
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
                x={padding + imageState.x}
                y={padding + imageState.y}
                width={imageState.width}
                height={imageState.height}
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
                  x={padding + imageState.x}
                  y={padding + imageState.y}
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
                  x={padding + imageState.x + imageState.width}
                  y={padding + imageState.y}
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
                  x={padding + imageState.x}
                  y={padding + imageState.y + imageState.height}
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
                  x={padding + imageState.x + imageState.width}
                  y={padding + imageState.y + imageState.height}
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

export default SmoothDraggableVenueShape;
