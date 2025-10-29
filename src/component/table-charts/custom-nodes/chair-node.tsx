"use client";

import type React from "react";
import { memo, useState, useCallback } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { User, Trash2, Pencil, X, Plus, GripVertical } from "lucide-react"; // ✅ Added GripVertical
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export interface ChairNodeData {
  event_id: string;
  label: string;
  type: "chair-row" | "chair-column";
  numChairs: number;
  chairs: {
    id: string;
    occupiedBy: string | null;
    occupiedByName: string | null;
  }[];
  width: number;
  height: number;
  onGuestDrop: (
    event: React.DragEvent,
    nodeId: string,
    chairId: string
  ) => void;
  onRemoveGuestFromChair: (
    nodeId: string,
    chairId: string,
    guestId: string
  ) => void;
  onDeleteChair: (nodeId: string) => void;
  onEditChair: (nodeId: string, newLabel: string, newNumChairs: number) => void;
}

interface ChairNodeProps extends NodeProps<ChairNodeData> {}

const ChairNodeInner = ({
  id,
  data,
  isConnectable,
  selected,
}: ChairNodeProps) => {
  const {
    label,
    type,
    numChairs,
    chairs,
    width,
    height,
    onGuestDrop,
    onRemoveGuestFromChair,
    onDeleteChair,
    onEditChair,
  } = data;

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(label);
  const [editNumChairs, setEditNumChairs] = useState(numChairs);
  const [hoveredChair, setHoveredChair] = useState<string | null>(null);
  const [chairDragOver, setChairDragOver] = useState<string | null>(null);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent, chairId: string) => {
      onGuestDrop(event, id, chairId);
      setChairDragOver(null);
    },
    [onGuestDrop, id]
  );

  // ✅ ADD THIS: Handle dragging guest FROM chair
  const handleGuestDragStart = useCallback(
    (
      event: React.DragEvent,
      guestId: string,
      guestName: string,
      chairId: string
    ) => {
      event.dataTransfer.setData("guestId", guestId);
      event.dataTransfer.setData("guestName", guestName);
      event.dataTransfer.setData("fromTableId", id);
      event.dataTransfer.setData("fromSeatId", chairId);
      event.dataTransfer.effectAllowed = "move";
      event.stopPropagation();
    },
    [id]
  );

  const handleEditConfirm = () => {
    onEditChair(id, editLabel, editNumChairs);
    setIsEditing(false);
  };

  const chairWidth = 40;
  const chairHeight = 40;
  const chairSpacing = 10;

  return (
    <div className="relative" style={{ width, height }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />

      {/* Container */}
      <div
        className="absolute inset-0 drag-handle-table flex items-center justify-center"
        style={{
          border: "1px dashed #ccc",
          borderRadius: "8px",
          backgroundColor: "#fafafa",
          padding: "10px",
        }}
      >
        {/* Label */}
        <div className="absolute top-1 left-2 text-xs font-semibold text-gray-700">
          {label}
        </div>

        {/* Chairs */}
        <div
          className={cn("flex", {
            "flex-row gap-2": type === "chair-row",
            "flex-col gap-2": type === "chair-column",
          })}
        >
          {chairs.map((chair, index) => {
            const isOccupied = chair.occupiedBy !== null;
            return (
              <div
                key={chair.id}
                className="relative nodrag"
                style={{ width: chairWidth, height: chairHeight }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "w-full h-full rounded border-2 flex items-center justify-center cursor-pointer transition-all",
                          {
                            "bg-purple-200 border-purple-500": isOccupied,
                            "bg-gray-100 border-gray-400 hover:bg-gray-200":
                              !isOccupied,
                            "ring-2 ring-blue-500": chairDragOver === chair.id,
                          }
                        )}
                        onDragOver={handleDragOver}
                        onDragEnter={() => setChairDragOver(chair.id)}
                        onDragLeave={() => setChairDragOver(null)}
                        onDrop={(e) => handleDrop(e, chair.id)}
                        onMouseEnter={() => setHoveredChair(chair.id)}
                        onMouseLeave={() => setHoveredChair(null)}
                      >
                        {isOccupied ? (
                          <User className="w-5 h-5 text-purple-800" />
                        ) : (
                          <Plus className="w-4 h-4 text-gray-500" />
                        )}

                        {/* ✅ ADD THIS: Drag Handle for moving guest */}
                        {isOccupied && hoveredChair === chair.id && (
                          <div
                            className="absolute -top-2 -left-2 w-6 h-6 bg-gray-700 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-800 transition-colors shadow-lg z-50 nodrag"
                            draggable={true}
                            onDragStart={
                              chair.occupiedBy && chair.occupiedByName
                                ? (e) =>
                                    handleGuestDragStart(
                                      e,
                                      chair.occupiedBy!,
                                      chair.occupiedByName!,
                                      chair.id
                                    )
                                : undefined
                            }
                          >
                            <GripVertical className="w-4 h-4 text-white" />
                          </div>
                        )}

                        {/* Remove Button */}
                        {isOccupied && chair.occupiedBy && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white hover:bg-red-600 z-40 nodrag"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveGuestFromChair(
                                id,
                                chair.id,
                                chair.occupiedBy!
                              );
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TooltipTrigger>
                    {!isOccupied && (
                      <TooltipContent>
                        <p>Drag guest here</p>
                        <TooltipPrimitive.Arrow />
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {/* Guest Name */}
                {isOccupied && chair.occupiedByName && (
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-medium text-gray-700 whitespace-nowrap nodrag">
                    {chair.occupiedByName}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      {selected && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-1 nodrag">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="text-black hover:bg-gray-100"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Chairs</p>
                <TooltipPrimitive.Arrow />
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteChair(id)}
                  className="text-black hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Chairs</p>
                <TooltipPrimitive.Arrow />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Chairs: {label}</DialogTitle>
            <DialogDescription>
              Update the label and number of chairs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editChairLabel" className="text-right">
                Label
              </Label>
              <Input
                id="editChairLabel"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editNumChairs" className="text-right">
                Number
              </Label>
              <Input
                id="editNumChairs"
                type="number"
                min={1}
                max={50}
                value={editNumChairs}
                onChange={(e) => setEditNumChairs(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditConfirm}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const ChairNode = memo(ChairNodeInner);
ChairNode.displayName = "ChairNode";
