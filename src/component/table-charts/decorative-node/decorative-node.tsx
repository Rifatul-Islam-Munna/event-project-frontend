"use client";

import type React from "react";
import { memo, useState, useRef, useCallback, useEffect } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import Image from "next/image";
import { decorativeItems } from "@/lib/DecoratorData";

export interface DecorativeNodeData {
  event_id: string;
  label: string;
  imageUrl: string;
  width: number;
  height: number;
  category: string;
  onDeleteDecorative: (nodeId: string) => void;
  onEditDecorative: (nodeId: string, newLabel: string) => void;
  onDecorativeResize?: (
    nodeId: string,
    newWidth: number,
    newHeight: number
  ) => void;
}

interface DecorativeNodeProps extends NodeProps<DecorativeNodeData> {}

const DecorativeNodeInner = ({ id, data, selected }: DecorativeNodeProps) => {
  const {
    label,
    imageUrl,
    width,
    height,
    category,
    onDeleteDecorative,
    onEditDecorative,
    onDecorativeResize,
  } = data;

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(label);

  // ✅ RESIZE STATE
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width);
  const [currentHeight, setCurrentHeight] = useState(height);
  const resizeDirection = useRef<"left" | "right" | "top" | "bottom" | null>(
    null
  );
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // ✅ CHECK IF IT'S A LINE
  const isLine = category === "line-horizontal" || category === "line-vertical";
  const isHorizontalLine = category === "line-horizontal";

  const handleEditConfirm = () => {
    onEditDecorative(id, editLabel);
    setIsEditing(false);
  };

  // ✅ IMPROVED RESIZE HANDLERS WITH SMOOTH MOVEMENT
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: "left" | "right" | "top" | "bottom") => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      resizeDirection.current = direction;
      startPos.current = {
        x: e.clientX,
        y: e.clientY,
        width: currentWidth,
        height: currentHeight,
      };

      // ✅ PREVENT REACT FLOW FROM INTERFERING
      document.body.style.userSelect = "none";
      document.body.style.cursor = isHorizontalLine ? "ew-resize" : "ns-resize";
    },
    [currentWidth, currentHeight, isHorizontalLine]
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeDirection.current) return;

      e.preventDefault();
      e.stopPropagation();

      // ✅ GET ZOOM LEVEL FROM REACT FLOW
      const reactFlowWrapper = document.querySelector(".react-flow__viewport");
      let zoom = 1;
      if (reactFlowWrapper) {
        const transform = window.getComputedStyle(reactFlowWrapper).transform;
        if (transform && transform !== "none") {
          const matrix = transform.match(/matrix\(([^)]+)\)/);
          if (matrix) {
            const values = matrix[1].split(",");
            zoom = parseFloat(values[0]);
          }
        }
      }

      // ✅ CALCULATE DELTA WITH ZOOM COMPENSATION
      const deltaX = (e.clientX - startPos.current.x) / zoom;
      const deltaY = (e.clientY - startPos.current.y) / zoom;

      if (isHorizontalLine) {
        // Horizontal line - adjust width
        if (resizeDirection.current === "right") {
          const newWidth = Math.max(20, startPos.current.width + deltaX);
          setCurrentWidth(Math.round(newWidth));
        } else if (resizeDirection.current === "left") {
          const newWidth = Math.max(20, startPos.current.width - deltaX);
          setCurrentWidth(Math.round(newWidth));
        }
      } else {
        // Vertical line - adjust height
        if (resizeDirection.current === "bottom") {
          const newHeight = Math.max(20, startPos.current.height + deltaY);
          setCurrentHeight(Math.round(newHeight));
        } else if (resizeDirection.current === "top") {
          const newHeight = Math.max(20, startPos.current.height - deltaY);
          setCurrentHeight(Math.round(newHeight));
        }
      }
    },
    [isHorizontalLine]
  );

  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    resizeDirection.current = null;

    // ✅ RESTORE NORMAL CURSOR AND SELECTION
    document.body.style.userSelect = "";
    document.body.style.cursor = "";

    // Update parent with new dimensions
    if (onDecorativeResize) {
      onDecorativeResize(id, currentWidth, currentHeight);
    }
  }, [id, currentWidth, currentHeight, onDecorativeResize, isResizing]);

  // ✅ ATTACH/DETACH EVENT LISTENERS PROPERLY
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleResizeEnd);

      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Update local state when props change
  useEffect(() => {
    if (!isResizing) {
      setCurrentWidth(width);
      setCurrentHeight(height);
    }
  }, [width, height, isResizing]);

  return (
    <div
      className="relative"
      style={{ width: currentWidth, height: currentHeight }}
    >
      {/* ✅ RENDER LINE OR DECORATIVE ITEM */}
      {isLine ? (
        // LINE RENDERING
        <div
          className="absolute inset-0 drag-handle-decorative"
          style={{
            width: currentWidth,
            height: currentHeight,
            backgroundColor: isResizing ? "#4b5563" : "#6b7280",
            borderRadius: "2px",
            border: selected ? "2px solid #3b82f6" : "none",
            boxShadow: selected
              ? "0 0 0 2px #3b82f6"
              : "0 2px 4px rgba(0,0,0,0.2)",
            transition: isResizing ? "none" : "all 0.2s ease",
            cursor: "move",
            pointerEvents: isResizing ? "none" : "auto", // ✅ IMPORTANT
          }}
        >
          {/* ✅ SHOW DIMENSIONS WHILE RESIZING */}
          {isResizing && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none">
              {isHorizontalLine
                ? `${Math.round(currentWidth)}px`
                : `${Math.round(currentHeight)}px`}
            </div>
          )}
        </div>
      ) : (
        // DECORATIVE ITEM RENDERING
        <div
          className="absolute inset-0 drag-handle-decorative flex flex-col items-center justify-center"
          style={{
            width: currentWidth,
            height: currentHeight,
            borderRadius: "8px",
            border: selected ? "2px solid #3b82f6" : "1px solid transparent",
            backgroundColor: "transparent",
            transition: "all 0.2s ease",
            cursor: "move",
          }}
        >
          <Image
            src={
              decorativeItems.find((i) => i.label.trim() === label.trim())
                ?.imageUrl.src || ""
            }
            alt={label}
            className="w-full h-full object-contain pointer-events-none"
            style={{
              maxWidth: currentWidth,
              maxHeight: currentHeight,
              filter: selected ? "brightness(1.1)" : "brightness(1)",
            }}
            width={currentWidth}
            height={currentHeight}
            draggable={false}
          />

          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {label}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons when selected */}
      {selected && !isResizing && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 transition-opacity duration-200 nodrag z-50">
          <TooltipProvider>
            {!isLine && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditLabel(label);
                      setIsEditing(true);
                    }}
                    className="w-8 h-8 text-black hover:bg-gray-100 bg-white/90"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Label</p>
                  <TooltipPrimitive.Arrow />
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteDecorative(id)}
                  className="w-10 h-10 text-red-600 hover:bg-red-50 bg-white/90"
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete {isLine ? "Line" : "Item"}</p>
                <TooltipPrimitive.Arrow />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* ✅ INTERACTIVE RESIZE HANDLES FOR LINES */}
      {isLine && selected && (
        <>
          {isHorizontalLine ? (
            <>
              {/* Left handle */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-blue-500 rounded-full cursor-ew-resize nodrag border-2 border-white shadow-lg z-[9999] hover:bg-blue-600 hover:scale-125 transition-all"
                title="Drag to resize"
                onMouseDown={(e) => handleResizeStart(e, "left")}
                style={{ pointerEvents: "auto" }} // ✅ IMPORTANT
              />
              {/* Right handle */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 bg-blue-500 rounded-full cursor-ew-resize nodrag border-2 border-white shadow-lg z-[9999] hover:bg-blue-600 hover:scale-125 transition-all"
                title="Drag to resize"
                onMouseDown={(e) => handleResizeStart(e, "right")}
                style={{ pointerEvents: "auto" }} // ✅ IMPORTANT
              />
            </>
          ) : (
            <>
              {/* Top handle */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-blue-500 rounded-full cursor-ns-resize nodrag border-2 border-white shadow-lg z-[9999] hover:bg-blue-600 hover:scale-125 transition-all"
                title="Drag to resize"
                onMouseDown={(e) => handleResizeStart(e, "top")}
                style={{ pointerEvents: "auto" }} // ✅ IMPORTANT
              />
              {/* Bottom handle */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-5 h-5 bg-blue-500 rounded-full cursor-ns-resize nodrag border-2 border-white shadow-lg z-[9999] hover:bg-blue-600 hover:scale-125 transition-all"
                title="Drag to resize"
                onMouseDown={(e) => handleResizeStart(e, "bottom")}
                style={{ pointerEvents: "auto" }} // ✅ IMPORTANT
              />
            </>
          )}
        </>
      )}

      {/* Edit label modal */}
      {!isLine && isEditing && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 nodrag">
          <div className="bg-white border rounded-lg shadow-lg p-3 min-w-[200px]">
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm mb-2"
              placeholder="Enter label"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditConfirm();
                if (e.key === "Escape") setIsEditing(false);
              }}
            />
            <div className="flex gap-1">
              <Button size="sm" onClick={handleEditConfirm} className="flex-1">
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DecorativeNode = memo(DecorativeNodeInner);
DecorativeNode.displayName = "DecorativeNode";
