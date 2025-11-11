"use client";

import type React from "react";
import { memo, useState } from "react";
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
  onDecorativeMove?: (
    nodeId: string,
    position: { x: number; y: number }
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
  } = data;

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(label);

  // ✅ CHECK IF IT'S A LINE
  const isLine = category === "line-horizontal" || category === "line-vertical";
  const isHorizontalLine = category === "line-horizontal";

  const handleEditConfirm = () => {
    onEditDecorative(id, editLabel);
    setIsEditing(false);
  };

  return (
    <div className="relative" style={{ width: width, height: height }}>
      {/* ✅ RENDER LINE OR DECORATIVE ITEM */}
      {isLine ? (
        // LINE RENDERING
        <div
          className="absolute inset-0 drag-handle-decorative"
          style={{
            width: width,
            height: height,
            backgroundColor: "#6b7280", // Gray color
            borderRadius: "2px",
            border: selected ? "2px solid #3b82f6" : "none",
            boxShadow: selected
              ? "0 0 0 2px #3b82f6"
              : "0 2px 4px rgba(0,0,0,0.2)",
            transition: "all 0.2s ease",
            cursor: "move",
          }}
        />
      ) : (
        // DECORATIVE ITEM RENDERING (YOUR EXISTING CODE)
        <div
          className="absolute inset-0 drag-handle-decorative flex flex-col items-center justify-center"
          style={{
            width: width,
            height: height,
            borderRadius: "8px",
            border: selected ? "2px solid #3b82f6" : "1px solid transparent",
            backgroundColor: "transparent",
            transition: "all 0.2s ease",
            cursor: "move",
          }}
        >
          {/* Image */}
          <Image
            src={
              decorativeItems.find((i) => i.label.trim() === label.trim())
                ?.imageUrl.src || ""
            }
            alt={label}
            className="w-full h-full object-contain pointer-events-none"
            style={{
              maxWidth: width,
              maxHeight: height,
              filter: selected ? "brightness(1.1)" : "brightness(1)",
            }}
            width={width}
            height={height}
            draggable={false}
          />

          {/* Label overlay */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {label}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons when selected */}
      {selected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 transition-opacity duration-200 nodrag">
          <TooltipProvider>
            {/* ✅ SHOW EDIT ONLY FOR NON-LINES */}
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

      {/* ✅ RESIZE HANDLES FOR LINES ONLY */}
      {isLine && selected && (
        <>
          {isHorizontalLine ? (
            <>
              {/* Left handle for horizontal line */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-ew-resize nodrag border-2 border-white shadow-lg z-50"
                title="Drag to resize length"
              />
              {/* Right handle for horizontal line */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-ew-resize nodrag border-2 border-white shadow-lg z-50"
                title="Drag to resize length"
              />
            </>
          ) : (
            <>
              {/* Top handle for vertical line */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-ns-resize nodrag border-2 border-white shadow-lg z-50"
                title="Drag to resize length"
              />
              {/* Bottom handle for vertical line */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-ns-resize nodrag border-2 border-white shadow-lg z-50"
                title="Drag to resize length"
              />
            </>
          )}
        </>
      )}

      {/* Edit label modal - ONLY FOR DECORATIVE ITEMS */}
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
