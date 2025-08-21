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
        ...nodeData,
        data: {
          ...nodeData.data,
        },
      }));
      setNodes(readOnlyNodes);
    }
  }, [seatPlandata?.data, setNodes]);

  return (
    <div className="h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange} // Keep basic node changes for positioning but no editing
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
        nodesDraggable={false} // Disable node dragging
        nodesConnectable={false} // Disable node connections
        elementsSelectable={false} // Disable selection
      >
        <Controls showInteractive={false} /> {/* Hide interactive controls */}
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
