"use client";

import type { Guest } from "@/@types/events-details";

export type Point = { x: number; y: number };
export type PlannerViewport = { x: number; y: number; zoom: number };
export type NodeKind = "tableNode" | "chairNode" | "decorativeNode";
export type LineResizeHandle = "start" | "end";

export type TableType =
  | "rectangular"
  | "square"
  | "circular"
  | "rectangular-one-sided"
  | "circular-single-seat"
  | "chair-row"
  | "chair-column"
  | "line-horizontal"
  | "line-vertical";

export interface PlannerSeat {
  id: string;
  occupiedBy: string | null;
  occupiedByName: string | null;
}

export interface TableNodeData {
  event_id: string;
  label: string;
  type: Extract<
    TableType,
    "rectangular" | "square" | "circular" | "rectangular-one-sided" | "circular-single-seat"
  >;
  seats: PlannerSeat[];
  width: number;
  height: number;
  numSeats: number;
  measurementType: string;
  widthTable: number;
  heightTable: number;
  onGuestDrop?: (...args: unknown[]) => void;
  onRemoveGuestFromSeat?: (...args: unknown[]) => void;
  onDeleteTable?: (...args: unknown[]) => void;
  onEditTable?: (...args: unknown[]) => void;
}

export interface ChairNodeData {
  event_id: string;
  label: string;
  type: Extract<TableType, "chair-row" | "chair-column">;
  chairs: PlannerSeat[];
  width: number;
  height: number;
  numChairs: number;
}

export interface DecorativeNodeData {
  event_id: string;
  label: string;
  imageUrl: string;
  width: number;
  height: number;
  category: string;
}

interface BasePlannerNode<TData> {
  id: string;
  type: NodeKind;
  event_id: string;
  position: Point;
  data: TData;
  style?: {
    width?: string;
    height?: string;
  };
}

export type TablePlannerNode = BasePlannerNode<TableNodeData> & {
  type: "tableNode";
};

export type ChairPlannerNode = BasePlannerNode<ChairNodeData> & {
  type: "chairNode";
};

export type DecorativePlannerNode = BasePlannerNode<DecorativeNodeData> & {
  type: "decorativeNode";
};

export type PlannerNode = TablePlannerNode | ChairPlannerNode | DecorativePlannerNode;
export type SeatingPlannerNode = TablePlannerNode | ChairPlannerNode;

export interface PersistedSeatPlanNode {
  id: string;
  type: "tableNode" | "chairNode";
  event_id: string;
  position: Point;
  data: {
    event_id: string;
    label: string;
    type: TableType;
    seats: PlannerSeat[];
    width: number;
    height: number;
    numSeats: number;
    measurementType?: string;
    widthTable?: number;
    heightTable?: number;
  };
  style?: {
    width?: string;
    height?: string;
  };
}

export interface PersistedDecorativeNode {
  id: string;
  type: "decorativeNode";
  event_id: string;
  position: Point;
  data: {
    event_id: string;
    label: string;
    imageUrl: string;
    width: number;
    height: number;
    category: string;
  };
  style?: {
    width?: string;
    height?: string;
  };
}

export interface ChangedObjects {
  guest: Guest[];
  node: PersistedSeatPlanNode[];
  decorativeItems: PersistedDecorativeNode[];
}

export interface EditDialogState {
  nodeId: string;
  kind: NodeKind;
  label: string;
  seatsOrChairs: number;
}

export interface GuestDragState {
  guestId: string;
  guestName: string;
  fromNodeId: string;
  fromSeatId: string;
  clientX: number;
  clientY: number;
}

export interface LineResizeState {
  nodeId: string;
  orientation: "horizontal" | "vertical";
  handle: LineResizeHandle;
  startPointer: Point;
  startNodePosition: Point;
  startWidth: number;
  startHeight: number;
}

export interface SeatHitTarget {
  nodeId: string;
  seatId: string;
}

export interface SeatGeometry {
  seat: PlannerSeat;
  x: number;
  y: number;
  width: number;
  height: number;
  labelX: number;
  labelY: number;
}

export const MIN_ZOOM = 0.06;
export const MAX_ZOOM = 2.5;
export const FOCUS_ZOOM = 1.35;
export const ZOOM_STEP = 1.12;
export const GRID_GAP = 40;
export const SNAP_GRID = 15;
export const LARGE_CANVAS_SIZE = 20000;
export const CHAIR_SIZE = 40;
export const CHAIR_GAP = 10;
