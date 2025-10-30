"use client";

import type React from "react";
import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReadOnlyChairNodeData {
  event_id: string;
  label: string;
  type: "chair-row" | "chair-column";
  numChairs?: number;
  chairs?: {
    id: string;
    occupiedBy: string | null;
    occupiedByName: string | null;
  }[];
  seats?: {
    id: string;
    occupiedBy: string | null;
    occupiedByName: string | null;
  }[];
  width: number;
  height: number;
  searchQuery?: string;
}

interface ReadOnlyChairNodeProps extends NodeProps<ReadOnlyChairNodeData> {}

const ReadOnlyChairNodeInner = ({ data }: ReadOnlyChairNodeProps) => {
  const { label, type, width, height, searchQuery } = data;

  // ✅ Handle both 'chairs' and 'seats' properties
  const chairsArray = data.chairs || data.seats || [];

  const chairWidth = 40;
  const chairHeight = 40;

  return (
    <div className="relative" style={{ width, height }}>
      <Handle type="target" position={Position.Top} isConnectable={false} />

      {/* Container */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          border: "1px dashed #ccc",
          borderRadius: "8px",
          backgroundColor: "#fafafa",
          padding: "10px",
          pointerEvents: "none",
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
          {chairsArray.map((chair) => {
            const isOccupied = chair.occupiedBy !== null;
            const matchesSearch =
              searchQuery &&
              chair.occupiedByName &&
              chair.occupiedByName
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            return (
              <div
                key={chair.id}
                className="relative"
                style={{ width: chairWidth, height: chairHeight }}
              >
                <div
                  className={cn(
                    "w-full h-full rounded border-2 flex items-center justify-center transition-all",
                    {
                      "bg-purple-200 border-purple-500": isOccupied,
                      "bg-gray-100 border-gray-400": !isOccupied,
                      "ring-4 ring-yellow-400 ring-offset-2": matchesSearch,
                    }
                  )}
                >
                  {isOccupied ? (
                    <User className="w-5 h-5 text-purple-800" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-500" />
                  )}
                </div>

                {/* Guest Name */}
                {isOccupied && chair.occupiedByName && (
                  <div
                    className={cn(
                      "absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-medium whitespace-nowrap",
                      {
                        "text-yellow-700 font-bold": matchesSearch,
                        "text-gray-700": !matchesSearch,
                      }
                    )}
                  >
                    {chair.occupiedByName}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
};

export const ReadOnlyChairNode = memo(ReadOnlyChairNodeInner);
ReadOnlyChairNode.displayName = "ReadOnlyChairNode";
