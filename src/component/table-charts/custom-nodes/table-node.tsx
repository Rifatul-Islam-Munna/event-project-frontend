"use client";

import type React from "react";
import { memo, useState, useCallback } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { TableType } from "../wedding-planner"; // Import TableType

import { User, Trash2, Pencil, X, Plus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import * as TooltipPrimitive from "@radix-ui/react-tooltip"; // Import TooltipPrimitive directly

import { cn } from "@/lib/utils";
import {
  getRectangularSeatDistribution,
  type TableNodeData,
} from "../wedding-planner";

interface CustomTableNodeProps extends NodeProps<TableNodeData> {}

const TableNodeInner = ({
  id,
  data,
  isConnectable,
  selected,
}: CustomTableNodeProps) => {
  const {
    label,
    type,
    seats,
    width,
    height,
    numSeats,
    onGuestDrop,
    onRemoveGuestFromSeat,
    onDeleteTable,
    onEditTable,
    measurementType,
    widthTable,
    heightTable,
  } = data;

  console.log("node data->", data);

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(label);
  const [editNumSeats, setEditNumSeats] = useState(numSeats);
  const [isSeatDragOver, setIsSeatDragOver] = useState<string | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleSeatDragEnter = useCallback((seatId: string) => {
    setIsSeatDragOver(seatId);
  }, []);

  const handleSeatDragLeave = useCallback(() => {
    setIsSeatDragOver(null);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent, seatId: string) => {
      const fromTableId = event.dataTransfer.getData("fromTableId");
      const fromSeatId = event.dataTransfer.getData("fromSeatId");

      // If guest is coming from another table, handle the transfer directly
      if (fromTableId && fromSeatId && fromTableId !== id) {
        // The onGuestDrop should handle removing from source and adding to target
        onGuestDrop(event, id, seatId);
      } else {
        // Normal drop from sidebar or same table
        onGuestDrop(event, id, seatId);
      }
      setIsSeatDragOver(null);
    },
    [onGuestDrop, id]
  );

  const handleGuestDragStart = useCallback(
    (
      event: React.DragEvent,
      guestId: string,
      guestName: string,
      seatId: string
    ) => {
      // Critical: Set drag data first
      event.dataTransfer.setData("guestId", guestId);
      event.dataTransfer.setData("guestName", guestName);
      event.dataTransfer.setData("fromTableId", id);
      event.dataTransfer.setData("fromSeatId", seatId);
      event.dataTransfer.effectAllowed = "move";

      // Stop propagation to prevent React Flow from handling this
      event.stopPropagation();
    },
    [id]
  );

  const getSeatPosition = (
    index: number,
    totalSeats: number,
    tableType: TableType,
    tableWidth: number,
    tableHeight: number
  ) => {
    const seatDiameter = 30; // Consistent seat size
    const seatRadius = seatDiameter / 2;
    const tableEdgeOffset = 15; // Distance from table edge to seat border (increased for better visual spacing)
    const seatSpacing = 15; // Space between seat centers

    if (tableType === "circular") {
      const tableRadius = Math.min(tableWidth, tableHeight) / 2;
      const circleRadius = tableRadius + tableEdgeOffset; // Radius for the circle on which seats are placed
      const angle = (index / totalSeats) * 2 * Math.PI;
      const x = tableWidth / 2 + circleRadius * Math.cos(angle) - seatRadius;
      const y = tableHeight / 2 + circleRadius * Math.sin(angle) - seatRadius;
      return { left: x, top: y };
    } else if (tableType === "circular-single-seat") {
      const x = tableWidth / 2 - seatRadius;
      const y = tableHeight / 2 - seatRadius;
      return { left: x, top: y };
    } else if (tableType === "rectangular-one-sided") {
      // Seats only on the top side, evenly spaced and centered
      const totalSeatsWidth =
        totalSeats * seatDiameter +
        (totalSeats > 1 ? (totalSeats - 1) * seatSpacing : 0);
      const startX = (tableWidth - totalSeatsWidth) / 2;
      const xCenter =
        startX + index * (seatDiameter + seatSpacing) + seatRadius;
      const yCenter = 0; // Relative to table top edge
      return {
        left: xCenter - seatRadius,
        top: yCenter - tableEdgeOffset - seatRadius,
      };
    } else {
      // Rectangular or Square (distribute seats on all four sides, centered)
      const { topSeats, rightSeats, bottomSeats, leftSeats } =
        getRectangularSeatDistribution(totalSeats, tableType === "square");

      let xCenter, yCenter; // These will be the center coordinates of the seat

      // Calculate total space occupied by seats on each side for centering
      const totalWidthOccupiedByTopSeats =
        topSeats * seatDiameter +
        (topSeats > 0 ? (topSeats - 1) * seatSpacing : 0);
      const totalWidthOccupiedByBottomSeats =
        bottomSeats * seatDiameter +
        (bottomSeats > 0 ? (bottomSeats - 1) * seatSpacing : 0);
      const totalHeightOccupiedByRightSeats =
        rightSeats * seatDiameter +
        (rightSeats > 0 ? (rightSeats - 1) * seatSpacing : 0);
      const totalHeightOccupiedByLeftSeats =
        leftSeats * seatDiameter +
        (leftSeats > 0 ? (leftSeats - 1) * seatSpacing : 0);

      // Calculate starting offsets for centering groups of seats
      const startXTopBottom =
        (tableWidth -
          Math.max(
            totalWidthOccupiedByTopSeats,
            totalWidthOccupiedByBottomSeats
          )) /
        2;
      const startYLeftRight =
        (tableHeight -
          Math.max(
            totalHeightOccupiedByLeftSeats,
            totalHeightOccupiedByRightSeats
          )) /
        2;

      let currentSeatIndexOnSide;

      // Top side
      if (index < topSeats) {
        currentSeatIndexOnSide = index;
        xCenter =
          startXTopBottom +
          currentSeatIndexOnSide * (seatDiameter + seatSpacing) +
          seatRadius;
        yCenter = 0; // Relative to table top edge
      }
      // Right side
      else if (index < topSeats + rightSeats) {
        currentSeatIndexOnSide = index - topSeats;
        xCenter = tableWidth; // Relative to table right edge
        yCenter =
          startYLeftRight +
          currentSeatIndexOnSide * (seatDiameter + seatSpacing) +
          seatRadius;
      }
      // Bottom side
      else if (index < topSeats + rightSeats + bottomSeats) {
        currentSeatIndexOnSide = index - (topSeats + rightSeats);
        xCenter =
          startXTopBottom +
          currentSeatIndexOnSide * (seatDiameter + seatSpacing) +
          seatRadius;
        yCenter = tableHeight; // Relative to table bottom edge
      }
      // Left side
      else {
        currentSeatIndexOnSide = index - (topSeats + rightSeats + bottomSeats);
        xCenter = 0; // Relative to table left edge
        yCenter =
          startYLeftRight +
          currentSeatIndexOnSide * (seatDiameter + seatSpacing) +
          seatRadius;
      }

      // Apply offset to move seats outside the table
      if (index < topSeats) {
        // Top side
        yCenter -= tableEdgeOffset;
      } else if (index < topSeats + rightSeats) {
        // Right side
        xCenter += tableEdgeOffset;
      } else if (index < topSeats + rightSeats + bottomSeats) {
        // Bottom side
        yCenter += tableEdgeOffset;
      } else {
        // Left side
        xCenter -= tableEdgeOffset;
      }

      // Convert center coordinates to top-left for the div
      return { left: xCenter - seatRadius, top: yCenter - seatRadius };
    }
  };

  const handleEditConfirm = () => {
    onEditTable(id, editLabel, editNumSeats);
    setIsEditing(false);
  };

  const tableStyle: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius:
      type === "circular" || type === "circular-single-seat" ? "50%" : "8px",
    border: "1px solid black",
    backgroundColor: "#f8f8f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  };

  const seatsToRender = Array.isArray(seats) ? seats : [];
  console.log(numSeats, seats);

  return (
    <div className="relative" style={{ width: width, height: height }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />

      {/* Table Body - This is the ONLY draggable part */}
      <div
        className="absolute inset-0 drag-handle-table flex flex-col"
        style={tableStyle}
      >
        <div className="text-sm font-semibold text-gray-700 z-10">{label}</div>
        <span className=" text-[6px] text-gray-500">
          {widthTable ?? 0}x{heightTable ?? 0}-{measurementType}
        </span>
      </div>

      {/* Seats - These have nodrag class to prevent React Flow dragging */}
      {seatsToRender.map((seat, index) => {
        const isOccupied = seat.occupiedBy !== null;
        const position = getSeatPosition(index, numSeats, type, width, height);
        return (
          <div
            key={seat.id}
            className="absolute nodrag" // CRITICAL: nodrag class prevents React Flow from handling drag
            style={{ left: position.left, top: position.top }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`w-8 h-8 rounded-full border border-black flex items-center justify-center cursor-pointer transition-colors duration-200 relative nodrag
                                  ${
                                    isOccupied
                                      ? "bg-purple-200 text-purple-800"
                                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                  }
                                  ${
                                    isSeatDragOver === seat.id
                                      ? "ring-2 ring-blue-500"
                                      : ""
                                  }`}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleSeatDragEnter(seat.id)}
                    onDragLeave={handleSeatDragLeave}
                    onDrop={(e) => handleDrop(e, seat.id)}
                    onMouseEnter={() => setHoveredSeat(seat.id)}
                    onMouseLeave={() => setHoveredSeat(null)}
                  >
                    {isOccupied ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}

                    {/* Guest Drag Handle - CRITICAL: This is the draggable element */}
                    {isOccupied && hoveredSeat === seat.id && (
                      <div
                        className="absolute -top-2 -left-2 w-6 h-6 bg-gray-700 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-800 transition-colors shadow-lg z-50 nodrag"
                        draggable={true}
                        onDragStart={
                          seat.occupiedBy && seat.occupiedByName
                            ? (e) =>
                                handleGuestDragStart(
                                  e,
                                  seat.occupiedBy!,
                                  seat.occupiedByName!,
                                  seat.id
                                )
                            : undefined
                        }
                      >
                        <GripVertical className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Remove Guest Button */}
                    {isOccupied && seat.occupiedBy && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white hover:bg-red-600 z-40 nodrag"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveGuestFromSeat(id, seat.id, seat.occupiedBy!);
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

            {/* Guest Name Label */}
            {isOccupied && seat.occupiedByName && (
              <div
                className={cn(
                  "absolute w-max text-center text-[7px] font-medium text-gray-700 -translate-x-1/2 left-1/2 pointer-events-none nodrag",
                  {
                    "mt-1": index % 2 === 0,
                    "-mt-12": index % 2 !== 0,
                  }
                )}
              >
                {seat.occupiedByName}
              </div>
            )}
          </div>
        );
      })}

      {/* Table Action Buttons */}
      {selected && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-1 transition-opacity duration-200 nodrag">
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
                <p>Edit Table</p>
                <TooltipPrimitive.Arrow />
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteTable(id)}
                  className="text-black hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Table</p>
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

      {/* Edit Table Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Table: {label}</DialogTitle>
            <DialogDescription>
              Update the name and number of seats for this table.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTableName" className="text-right">
                Table Name
              </Label>
              <Input
                id="editTableName"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="col-span-3"
              />
            </div>
            {type !== "circular-single-seat" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editNumSeats" className="text-right">
                  Number of Seats
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Slider
                    id="editNumSeats"
                    min={type === "rectangular-one-sided" ? 1 : 2}
                    max={20}
                    step={1}
                    value={[editNumSeats]}
                    onValueChange={(val) => setEditNumSeats(val[0])}
                    className="w-[calc(100%-40px)]"
                  />
                  <span className="w-10 text-right">{editNumSeats}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleEditConfirm}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const TableNode = memo(TableNodeInner);
TableNode.displayName = "TableNode";
