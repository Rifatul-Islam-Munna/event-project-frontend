"use client";
import { useState, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import type { Guest } from "@/@types/events-details";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAllGuest, getAllSeatPlan } from "@/actions/fetch-action";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { ReadOnlyTableNode } from "./table-node-readonly";

export type TableType =
  | "rectangular"
  | "square"
  | "circular"
  | "rectangular-one-sided"
  | "circular-single-seat";

export interface TableNodeData {
  event_id: string;
  label: string;
  type: TableType;
  seats: {
    id: string;
    occupiedBy: string | null;
    occupiedByName: string | null;
  }[];
  width: number;
  height: number;
  numSeats: number;
}

const nodeTypes = {
  tableNode: ReadOnlyTableNode,
};

export const getRectangularSeatDistribution = (
  totalSeats: number,
  isSquare: boolean
) => {
  let topSeats = 0;
  let bottomSeats = 0;
  let leftSeats = 0;
  let rightSeats = 0;

  if (totalSeats < 1)
    return { topSeats: 0, rightSeats: 0, bottomSeats: 0, leftSeats: 0 };

  if (isSquare) {
    const seatsPerSide = Math.floor(totalSeats / 4);
    let remainder = totalSeats % 4;

    topSeats = seatsPerSide + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    rightSeats = seatsPerSide + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    bottomSeats = seatsPerSide + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    leftSeats = seatsPerSide + (remainder > 0 ? 1 : 0);
  } else {
    if (totalSeats === 8) {
      topSeats = 3;
      bottomSeats = 3;
      leftSeats = 1;
      rightSeats = 1;
    } else {
      topSeats = Math.ceil(totalSeats / 2);
      bottomSeats = Math.floor(totalSeats / 2);
      leftSeats = 0;
      rightSeats = 0;
    }
  }
  return { topSeats, rightSeats, bottomSeats, leftSeats };
};

function ReadOnlyWeddingPlanner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      guestName: string;
      tableName: string;
      nodeId: string;
      seatId: string;
    }>
  >([]);

  const pathName = usePathname();

  const { data: seatPlandata, isLoading } = useQuery({
    queryKey: ["seat-plan", pathName.split("/").pop()],
    queryFn: () => getAllSeatPlan(pathName.split("/").pop() as string),
  });

  const { data } = useQuery({
    queryKey: ["get-all-guest", pathName.split("/").pop()],
    queryFn: () => getAllGuest(pathName.split("/").pop() as string),
  });

  useEffect(() => {
    if (data?.data) {
      setGuests(data.data);
    }
  }, [data]);

  useEffect(() => {
    if (seatPlandata?.data && seatPlandata.data.length > 0) {
      const readOnlyNodes = seatPlandata.data.map((nodeData: any) => ({
        id: nodeData.id,
        type: "tableNode",
        position: nodeData.position || { x: 0, y: 0 },
        data: {
          ...nodeData.data,
          searchQuery,
        },
        ...(nodeData.style && { style: nodeData.style }),
        ...(nodeData.width && { width: nodeData.width }),
        ...(nodeData.height && { height: nodeData.height }),
      }));

      console.log("[v0] Setting nodes:", readOnlyNodes);
      setNodes(readOnlyNodes);
    }
  }, [seatPlandata?.data, setNodes, searchQuery]);

  useEffect(() => {
    console.log("[v0] Current nodes state:", nodes);
  }, [nodes]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results: Array<{
      guestName: string;
      tableName: string;
      nodeId: string;
      seatId: string;
    }> = [];

    nodes.forEach((node) => {
      node.data.seats.forEach((seat) => {
        if (
          seat.occupiedByName &&
          seat.occupiedByName.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          results.push({
            guestName: seat.occupiedByName,
            tableName: node.data.label,
            nodeId: node.id,
            seatId: seat.id,
          });
        }
      });
    });

    setSearchResults(results);
  }, [searchQuery, nodes]);

  const scrollToTable = (nodeId: string) => {
    const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
    if (nodeElement) {
      nodeElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  };

  return (
    <div className="h-screen w-full relative">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg p-4 min-w-80">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by guest name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="mt-3 max-h-60 overflow-y-auto">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Found {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""}:
            </div>
            {searchResults.map((result, index) => (
              <div
                key={`${result.nodeId}-${result.seatId}`}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => scrollToTable(result.nodeId)}
              >
                <div>
                  <div className="font-medium text-sm">{result.guestName}</div>
                  <div className="text-xs text-gray-500">
                    Table: {result.tableName}
                  </div>
                </div>
                <div className="text-xs text-blue-600 hover:text-blue-800">
                  View →
                </div>
              </div>
            ))}
          </div>
        )}

        {searchQuery && searchResults.length === 0 && (
          <div className="mt-3 text-sm text-gray-500">
            No guests found matching "{searchQuery}"
          </div>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Controls showInteractive={false} />
        <MiniMap />
        <Background variant="dots" gap={15} size={1} />
      </ReactFlow>
    </div>
  );
}

export default function ReadOnlyWeddingPlannerWrapper() {
  return (
    <ReactFlowProvider>
      <ReadOnlyWeddingPlanner />
    </ReactFlowProvider>
  );
}
