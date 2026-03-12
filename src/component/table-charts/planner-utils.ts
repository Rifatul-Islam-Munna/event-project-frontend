"use client";

import { decorativeItems } from "@/lib/DecoratorData";
import {
  CHAIR_GAP,
  CHAIR_SIZE,
  ChairNodeData,
  DecorativePlannerNode,
  PersistedDecorativeNode,
  PersistedSeatPlanNode,
  PlannerNode,
  PlannerSeat,
  SeatingPlannerNode,
  SeatGeometry,
  SNAP_GRID,
  TableNodeData,
} from "./planner-types";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const snapValue = (value: number) => Math.round(value / SNAP_GRID) * SNAP_GRID;

export const snapPoint = (point: { x: number; y: number }) => ({
  x: snapValue(point.x),
  y: snapValue(point.y),
});

export const isChairNode = (
  node: PlannerNode,
): node is Extract<PlannerNode, { type: "chairNode" }> => node.type === "chairNode";

export const isTableNode = (
  node: PlannerNode,
): node is Extract<PlannerNode, { type: "tableNode" }> => node.type === "tableNode";

export const getNodeWidth = (node: PlannerNode) => node.data.width;
export const getNodeHeight = (node: PlannerNode) => node.data.height;

export const getDecorativeAsset = (category: string, label: string) =>
  decorativeItems.find(
    (item) => item.id === category || item.label.trim() === label.trim(),
  );

export const getRectangularSeatDistribution = (
  totalSeats: number,
  isSquare: boolean,
) => {
  let topSeats = 0;
  let bottomSeats = 0;
  let leftSeats = 0;
  let rightSeats = 0;

  if (totalSeats < 1) {
    return { topSeats: 0, rightSeats: 0, bottomSeats: 0, leftSeats: 0 };
  }

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
  } else if (totalSeats === 8) {
    topSeats = 3;
    bottomSeats = 3;
    leftSeats = 1;
    rightSeats = 1;
  } else {
    topSeats = Math.ceil(totalSeats / 2);
    bottomSeats = Math.floor(totalSeats / 2);
  }

  return { topSeats, rightSeats, bottomSeats, leftSeats };
};

export const calculateTableDimensions = (
  type: TableNodeData["type"],
  numSeats: number,
) => {
  const seatDiameter = 30;
  const seatSpacing = 15;
  const tablePadding = 44;

  if (type === "circular-single-seat") {
    return { width: 100, height: 100 };
  }

  if (type === "circular") {
    const minCircumference = numSeats * (seatDiameter + seatSpacing);
    const minDiameter = Math.max(136, minCircumference / Math.PI);
    return { width: minDiameter, height: minDiameter };
  }

  if (type === "rectangular-one-sided") {
    const requiredSeatWidth =
      numSeats * seatDiameter +
      (numSeats > 1 ? (numSeats - 1) * seatSpacing : 0);

    return {
      width: Math.max(160, requiredSeatWidth + tablePadding),
      height: 84,
    };
  }

  const { topSeats, rightSeats, bottomSeats, leftSeats } =
    getRectangularSeatDistribution(numSeats, type === "square");

  const maxHorizontalSeats = Math.max(topSeats, bottomSeats);
  const maxVerticalSeats = Math.max(leftSeats, rightSeats);

  const minWidthForSeats =
    maxHorizontalSeats > 0
      ? maxHorizontalSeats * seatDiameter +
        (maxHorizontalSeats - 1) * seatSpacing
      : 0;
  const minHeightForSeats =
    maxVerticalSeats > 0
      ? maxVerticalSeats * seatDiameter + (maxVerticalSeats - 1) * seatSpacing
      : 0;

  let width = Math.max(86, minWidthForSeats + tablePadding);
  let height = Math.max(54, minHeightForSeats + tablePadding);

  if (type === "square") {
    const maxSide = Math.max(width, height);
    width = maxSide;
    height = maxSide;
  }

  return { width, height };
};

export const calculateChairNodeDimensions = (
  type: ChairNodeData["type"],
  count: number,
) => ({
  width:
    type === "chair-row" ? count * (CHAIR_SIZE + CHAIR_GAP) + 20 : CHAIR_SIZE + 20,
  height:
    type === "chair-column"
      ? count * (CHAIR_SIZE + CHAIR_GAP) + 40
      : CHAIR_SIZE + 40,
});

export const serializeSeatPlanNode = (
  node: SeatingPlannerNode,
): PersistedSeatPlanNode => {
  if (isChairNode(node)) {
    return {
      id: node.id,
      type: "chairNode",
      event_id: node.event_id,
      position: node.position,
      data: {
        event_id: node.data.event_id,
        label: node.data.label,
        type: node.data.type,
        seats: node.data.chairs,
        width: node.data.width,
        height: node.data.height,
        numSeats: node.data.numChairs,
      },
      style: {
        width: `${node.data.width}px`,
        height: `${node.data.height}px`,
      },
    };
  }

  return {
    id: node.id,
    type: "tableNode",
    event_id: node.event_id,
    position: node.position,
    data: {
      event_id: node.data.event_id,
      label: node.data.label,
      type: node.data.type,
      seats: node.data.seats,
      width: node.data.width,
      height: node.data.height,
      numSeats: node.data.numSeats,
      measurementType: node.data.measurementType,
      widthTable: node.data.widthTable,
      heightTable: node.data.heightTable,
    },
    style: {
      width: `${node.data.width}px`,
      height: `${node.data.height}px`,
    },
  };
};

export const serializeDecorativeNode = (
  node: DecorativePlannerNode,
): PersistedDecorativeNode => ({
  id: node.id,
  type: "decorativeNode",
  event_id: node.event_id,
  position: node.position,
  data: {
    event_id: node.data.event_id,
    label: node.data.label,
    imageUrl: node.data.imageUrl,
    width: node.data.width,
    height: node.data.height,
    category: node.data.category,
  },
  style: {
    width: `${node.data.width}px`,
    height: `${node.data.height}px`,
  },
});

type HydratedSeatPlanPayload = PersistedSeatPlanNode & {
  data: PersistedSeatPlanNode["data"] & {
    chairs?: PersistedSeatPlanNode["data"]["seats"];
    numChairs?: number;
  };
};

type HydratedDecorativePayload = PersistedDecorativeNode;

export const hydrateSeatPlanNode = (
  rawNode: HydratedSeatPlanPayload,
): SeatingPlannerNode => {
  if (rawNode.type === "chairNode") {
    return {
      id: rawNode.id,
      type: "chairNode",
      event_id: rawNode.event_id,
      position: rawNode.position ?? { x: 0, y: 0 },
      data: {
        event_id: rawNode.data.event_id,
        label: rawNode.data.label,
        type: rawNode.data.type,
        chairs: rawNode.data.chairs ?? rawNode.data.seats ?? [],
        width: rawNode.data.width,
        height: rawNode.data.height,
        numChairs: rawNode.data.numChairs ?? rawNode.data.numSeats ?? 0,
      },
      style: rawNode.style,
    };
  }

  return {
    id: rawNode.id,
    type: "tableNode",
    event_id: rawNode.event_id,
    position: rawNode.position ?? { x: 0, y: 0 },
    data: {
      event_id: rawNode.data.event_id,
      label: rawNode.data.label,
      type: rawNode.data.type,
      seats: rawNode.data.seats ?? [],
      width: rawNode.data.width,
      height: rawNode.data.height,
      numSeats: rawNode.data.numSeats ?? 0,
      measurementType: rawNode.data.measurementType ?? "",
      widthTable: rawNode.data.widthTable ?? 0,
      heightTable: rawNode.data.heightTable ?? 0,
    },
    style: rawNode.style,
  };
};

export const hydrateDecorativeNode = (
  rawNode: HydratedDecorativePayload,
): DecorativePlannerNode => ({
  id: rawNode.id,
  type: "decorativeNode",
  event_id: rawNode.event_id,
  position: rawNode.position ?? { x: 0, y: 0 },
  data: {
    event_id: rawNode.data.event_id,
    label: rawNode.data.label,
    imageUrl: rawNode.data.imageUrl ?? "",
    width: rawNode.data.width ?? 80,
    height: rawNode.data.height ?? 80,
    category: rawNode.data.category,
  },
  style: rawNode.style,
});

export const getTableSeatPosition = (
  index: number,
  totalSeats: number,
  tableType: TableNodeData["type"],
  tableWidth: number,
  tableHeight: number,
) => {
  const seatDiameter = 30;
  const seatRadius = seatDiameter / 2;
  const tableEdgeOffset = 15;
  const seatSpacing = 15;

  if (tableType === "circular") {
    const tableRadius = Math.min(tableWidth, tableHeight) / 2;
    const circleRadius = tableRadius + tableEdgeOffset;
    const angle = (index / totalSeats) * Math.PI * 2;

    return {
      left: tableWidth / 2 + circleRadius * Math.cos(angle) - seatRadius,
      top: tableHeight / 2 + circleRadius * Math.sin(angle) - seatRadius,
    };
  }

  if (tableType === "circular-single-seat") {
    return {
      left: tableWidth / 2 - seatRadius,
      top: tableHeight / 2 - seatRadius,
    };
  }

  if (tableType === "rectangular-one-sided") {
    const totalSeatsWidth =
      totalSeats * seatDiameter +
      (totalSeats > 1 ? (totalSeats - 1) * seatSpacing : 0);
    const startX = (tableWidth - totalSeatsWidth) / 2;

    return {
      left: startX + index * (seatDiameter + seatSpacing),
      top: -tableEdgeOffset,
    };
  }

  const { topSeats, rightSeats, bottomSeats, leftSeats } =
    getRectangularSeatDistribution(totalSeats, tableType === "square");

  const totalTopWidth =
    topSeats * seatDiameter + (topSeats > 0 ? (topSeats - 1) * seatSpacing : 0);
  const totalBottomWidth =
    bottomSeats * seatDiameter +
    (bottomSeats > 0 ? (bottomSeats - 1) * seatSpacing : 0);
  const totalRightHeight =
    rightSeats * seatDiameter +
    (rightSeats > 0 ? (rightSeats - 1) * seatSpacing : 0);
  const totalLeftHeight =
    leftSeats * seatDiameter +
    (leftSeats > 0 ? (leftSeats - 1) * seatSpacing : 0);

  const startXTopBottom =
    (tableWidth - Math.max(totalTopWidth, totalBottomWidth)) / 2;
  const startYLeftRight =
    (tableHeight - Math.max(totalRightHeight, totalLeftHeight)) / 2;

  let xCenter = 0;
  let yCenter = 0;

  if (index < topSeats) {
    xCenter = startXTopBottom + index * (seatDiameter + seatSpacing) + seatRadius;
    yCenter = -tableEdgeOffset;
  } else if (index < topSeats + rightSeats) {
    const rightIndex = index - topSeats;
    xCenter = tableWidth + tableEdgeOffset;
    yCenter = startYLeftRight + rightIndex * (seatDiameter + seatSpacing) + seatRadius;
  } else if (index < topSeats + rightSeats + bottomSeats) {
    const bottomIndex = index - topSeats - rightSeats;
    xCenter =
      startXTopBottom + bottomIndex * (seatDiameter + seatSpacing) + seatRadius;
    yCenter = tableHeight + tableEdgeOffset;
  } else {
    const leftIndex = index - topSeats - rightSeats - bottomSeats;
    xCenter = -tableEdgeOffset;
    yCenter = startYLeftRight + leftIndex * (seatDiameter + seatSpacing) + seatRadius;
  }

  return { left: xCenter - seatRadius, top: yCenter - seatRadius };
};

export const getSeatGeometries = (node: SeatingPlannerNode): SeatGeometry[] => {
  if (isChairNode(node)) {
    return node.data.chairs.map((chair, index) => {
      const x =
        node.position.x +
        10 +
        (node.data.type === "chair-row" ? index * (CHAIR_SIZE + CHAIR_GAP) : 0);
      const y =
        node.position.y +
        24 +
        (node.data.type === "chair-column"
          ? index * (CHAIR_SIZE + CHAIR_GAP)
          : 0);

      return {
        seat: chair,
        x,
        y,
        width: CHAIR_SIZE,
        height: CHAIR_SIZE,
        labelX: x + CHAIR_SIZE / 2,
        labelY: y + CHAIR_SIZE + 10,
      };
    });
  }

  return node.data.seats.map((seat, index) => {
    const seatPosition = getTableSeatPosition(
      index,
      node.data.numSeats,
      node.data.type,
      node.data.width,
      node.data.height,
    );

    return {
      seat,
      x: node.position.x + seatPosition.left,
      y: node.position.y + seatPosition.top,
      width: 30,
      height: 30,
      labelX: node.position.x + seatPosition.left + 15,
      labelY:
        node.position.y + seatPosition.top + (index % 2 === 0 ? 42 : -18),
    };
  });
};

export const getSeatingNodeSeats = (node: SeatingPlannerNode) =>
  isChairNode(node) ? node.data.chairs : node.data.seats;

export const updateSeatingNodeSeats = (
  node: SeatingPlannerNode,
  seats: PlannerSeat[],
): SeatingPlannerNode =>
  isChairNode(node)
    ? {
        ...node,
        data: {
          ...node.data,
          chairs: seats,
        },
      }
    : {
        ...node,
        data: {
          ...node.data,
          seats,
        },
      };

export const loadImageElement = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
