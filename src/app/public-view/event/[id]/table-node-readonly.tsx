import type React from "react";
import { memo } from "react";
import type { NodeProps } from "reactflow";

import { User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";
import {
  getRectangularSeatDistribution,
  TableNodeData,
  TableType,
} from "@/component/table-charts/wedding-planner";

interface CustomTableNodeProps extends NodeProps<TableNodeData> {}

const ReadOnlyTableNodeInner = ({
  id,
  data,
  isConnectable,
}: CustomTableNodeProps) => {
  const { label, type, seats, width, height, numSeats } = data;

  const getSeatPosition = (
    index: number,
    totalSeats: number,
    tableType: TableType,
    tableWidth: number,
    tableHeight: number
  ) => {
    const seatDiameter = 30;
    const seatRadius = seatDiameter / 2;
    const tableEdgeOffset = 15;
    const seatSpacing = 15;

    if (tableType === "circular") {
      const tableRadius = Math.min(tableWidth, tableHeight) / 2;
      const circleRadius = tableRadius + tableEdgeOffset;
      const angle = (index / totalSeats) * 2 * Math.PI;
      const x = tableWidth / 2 + circleRadius * Math.cos(angle) - seatRadius;
      const y = tableHeight / 2 + circleRadius * Math.sin(angle) - seatRadius;
      return { left: x, top: y };
    } else if (tableType === "circular-single-seat") {
      const x = tableWidth / 2 - seatRadius;
      const y = tableHeight / 2 - seatRadius;
      return { left: x, top: y };
    } else if (tableType === "rectangular-one-sided") {
      const totalSeatsWidth =
        totalSeats * seatDiameter +
        (totalSeats > 1 ? (totalSeats - 1) * seatSpacing : 0);
      const startX = (tableWidth - totalSeatsWidth) / 2;
      const xCenter =
        startX + index * (seatDiameter + seatSpacing) + seatRadius;
      const yCenter = 0;
      return {
        left: xCenter - seatRadius,
        top: yCenter - tableEdgeOffset - seatRadius,
      };
    } else {
      const { topSeats, rightSeats, bottomSeats, leftSeats } =
        getRectangularSeatDistribution(totalSeats, tableType === "square");

      let xCenter, yCenter;

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

      if (index < topSeats) {
        currentSeatIndexOnSide = index;
        xCenter =
          startXTopBottom +
          currentSeatIndexOnSide * (seatDiameter + seatSpacing) +
          seatRadius;
        yCenter = 0;
      } else if (index < topSeats + rightSeats) {
        currentSeatIndexOnSide = index - topSeats;
        xCenter = tableWidth;
        yCenter =
          startYLeftRight +
          currentSeatIndexOnSide * (seatDiameter + seatSpacing) +
          seatRadius;
      } else if (index < topSeats + rightSeats + bottomSeats) {
        currentSeatIndexOnSide = index - (topSeats + rightSeats);
        xCenter =
          startXTopBottom +
          currentSeatIndexOnSide * (seatDiameter + seatSpacing) +
          seatRadius;
        yCenter = tableHeight;
      } else {
        currentSeatIndexOnSide = index - (topSeats + rightSeats + bottomSeats);
        xCenter = 0;
        yCenter =
          startYLeftRight +
          currentSeatIndexOnSide * (seatDiameter + seatSpacing) +
          seatRadius;
      }

      if (index < topSeats) {
        yCenter -= tableEdgeOffset;
      } else if (index < topSeats + rightSeats) {
        xCenter += tableEdgeOffset;
      } else if (index < topSeats + rightSeats + bottomSeats) {
        yCenter += tableEdgeOffset;
      } else {
        xCenter -= tableEdgeOffset;
      }

      return { left: xCenter - seatRadius, top: yCenter - seatRadius };
    }
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

  return (
    <div className="relative" style={{ width: width, height: height }}>
      <div className="absolute inset-0" style={tableStyle}>
        <div className="text-sm font-semibold text-gray-700 z-10">{label}</div>
      </div>
      {seatsToRender.map((seat, index) => {
        const isOccupied = seat.occupiedBy !== null;
        const position = getSeatPosition(index, numSeats, type, width, height);
        return (
          <div
            key={seat.id}
            className="absolute"
            style={{ left: position.left, top: position.top }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={
                      `w-8 h-8 rounded-full border border-black flex items-center justify-center transition-colors duration-200
                                  ${
                                    isOccupied
                                      ? "bg-purple-200 text-purple-800"
                                      : "bg-gray-200 text-gray-600"
                                  }` // Removed hover effects and drag functionality
                    }
                  >
                    {isOccupied && <User className="w-4 h-4" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {isOccupied ? (
                    <p>{seat.occupiedByName}</p>
                  ) : (
                    <p>Empty seat</p>
                  )}
                  <TooltipPrimitive.Arrow />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {isOccupied && seat.occupiedByName && (
              <div
                className={cn(
                  "absolute w-max text-center text-[7px] font-medium text-gray-700  -translate-x-1/2 left-1/2",
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
    </div>
  );
};

export const ReadOnlyTableNode = memo(ReadOnlyTableNodeInner);
ReadOnlyTableNode.displayName = "ReadOnlyTableNode";
