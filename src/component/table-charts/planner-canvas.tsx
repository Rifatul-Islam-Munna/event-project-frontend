"use client";

import { memo } from "react";
import type Konva from "konva";
import { Circle, Group, Image as KonvaImage, Rect, Text } from "react-konva";
import useImage from "use-image";
import type {
  ChairPlannerNode,
  DecorativePlannerNode,
  LineResizeHandle,
  Point,
  TablePlannerNode,
} from "./planner-types";
import { CHAIR_SIZE, type PlannerNode } from "./planner-types";
import { getDecorativeAsset, getSeatGeometries, getNodeHeight, getNodeWidth } from "./planner-utils";

interface DecorativeCanvasNodeProps {
  node: DecorativePlannerNode;
  isSelected: boolean;
  canInteract: boolean;
  onSelect: (nodeId: string) => void;
  onDragMove: (nodeId: string, position: Point) => void;
  onDragEnd: (nodeId: string, position: Point) => void;
  onLineResizeStart: (nodeId: string, handle: LineResizeHandle) => void;
}

function DecorativeCanvasNodeInner({
  node,
  isSelected,
  canInteract,
  onSelect,
  onDragMove,
  onDragEnd,
  onLineResizeStart,
}: DecorativeCanvasNodeProps) {
  const asset = getDecorativeAsset(node.data.category, node.data.label);
  const [image] = useImage(asset?.imageUrl?.src ?? "");
  const isLine =
    node.data.category === "line-horizontal" || node.data.category === "line-vertical";
  const isHorizontalLine = node.data.category === "line-horizontal";

  return (
    <Group
      x={node.position.x}
      y={node.position.y}
      draggable={canInteract}
      onClick={(event) => {
        event.cancelBubble = true;
        onSelect(node.id);
      }}
      onTap={(event) => {
        event.cancelBubble = true;
        onSelect(node.id);
      }}
      onDragStart={(event) => {
        event.cancelBubble = true;
        onSelect(node.id);
      }}
      onDragMove={(event) =>
        onDragMove(node.id, { x: event.target.x(), y: event.target.y() })
      }
      onDragEnd={(event) =>
        onDragEnd(node.id, { x: event.target.x(), y: event.target.y() })
      }
    >
      {isLine ? (
        <>
          <Rect
            width={node.data.width}
            height={node.data.height}
            fill="#64748b"
            stroke={isSelected ? "#0f766e" : undefined}
            strokeWidth={isSelected ? 2 : 0}
            cornerRadius={2}
            shadowColor="#0f172a"
            shadowBlur={6}
            shadowOpacity={0.16}
          />
          {isSelected && (
            <>
              <Circle
                x={isHorizontalLine ? 0 : node.data.width / 2}
                y={isHorizontalLine ? node.data.height / 2 : 0}
                radius={8}
                fill="#14b8a6"
                stroke="#ffffff"
                strokeWidth={2}
                onMouseDown={(event) => {
                  event.cancelBubble = true;
                  onLineResizeStart(node.id, "start");
                }}
              />
              <Circle
                x={isHorizontalLine ? node.data.width : node.data.width / 2}
                y={isHorizontalLine ? node.data.height / 2 : node.data.height}
                radius={8}
                fill="#14b8a6"
                stroke="#ffffff"
                strokeWidth={2}
                onMouseDown={(event) => {
                  event.cancelBubble = true;
                  onLineResizeStart(node.id, "end");
                }}
              />
            </>
          )}
        </>
      ) : (
        <>
          <Rect
            width={node.data.width}
            height={node.data.height}
            cornerRadius={12}
            stroke={isSelected ? "#0f766e" : "rgba(148,163,184,0.4)"}
            strokeWidth={isSelected ? 2 : 1}
            fill="rgba(255,255,255,0.8)"
          />
          {image ? (
            <KonvaImage
              image={image}
              width={node.data.width}
              height={node.data.height}
              cornerRadius={12}
            />
          ) : (
            <Rect
              width={node.data.width}
              height={node.data.height}
              cornerRadius={12}
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth={1}
            />
          )}
          <Text
            text={node.data.label}
            x={0}
            y={node.data.height + 8}
            width={node.data.width}
            align="center"
            fontSize={10}
            fill="#334155"
          />
        </>
      )}
    </Group>
  );
}

interface SeatingCanvasNodeBaseProps {
  isSelected: boolean;
  hoveredSeatKey: string | null;
  canInteract: boolean;
  onSelect: (nodeId: string) => void;
  onDragMove: (nodeId: string, position: Point) => void;
  onDragEnd: (nodeId: string, position: Point) => void;
  onSeatHover: (seatKey: string) => void;
  onSeatLeave: () => void;
  onGuestHandleDown: (
    event: Konva.KonvaEventObject<MouseEvent>,
    guestId: string,
    guestName: string,
    seatId: string,
    nodeId: string,
  ) => void;
  onRemoveGuest: (nodeId: string, seatId: string, guestId: string) => void;
}

interface TableCanvasNodeProps extends SeatingCanvasNodeBaseProps {
  node: TablePlannerNode;
}

function TableCanvasNodeInner({
  node,
  isSelected,
  hoveredSeatKey,
  canInteract,
  onSelect,
  onDragMove,
  onDragEnd,
  onSeatHover,
  onSeatLeave,
  onGuestHandleDown,
  onRemoveGuest,
}: TableCanvasNodeProps) {
  const seatGeometries = getSeatGeometries(node);
  const isCircle =
    node.data.type === "circular" || node.data.type === "circular-single-seat";
  const tableMeta =
    node.data.widthTable && node.data.heightTable && node.data.measurementType
      ? `${node.data.widthTable} x ${node.data.heightTable} ${node.data.measurementType}`
      : "";

  return (
    <Group
      x={node.position.x}
      y={node.position.y}
      draggable={canInteract}
      onClick={(event) => {
        event.cancelBubble = true;
        onSelect(node.id);
      }}
      onTap={(event) => {
        event.cancelBubble = true;
        onSelect(node.id);
      }}
      onDragStart={(event) => {
        event.cancelBubble = true;
        onSelect(node.id);
      }}
      onDragMove={(event) =>
        onDragMove(node.id, { x: event.target.x(), y: event.target.y() })
      }
      onDragEnd={(event) =>
        onDragEnd(node.id, { x: event.target.x(), y: event.target.y() })
      }
    >
      {isCircle ? (
        <Circle
          x={node.data.width / 2}
          y={node.data.height / 2}
          radius={Math.min(node.data.width, node.data.height) / 2}
          fill="#fffdf8"
          stroke={isSelected ? "#0f766e" : "#1f2937"}
          strokeWidth={isSelected ? 2 : 1}
          shadowColor="#0f172a"
          shadowBlur={14}
          shadowOpacity={0.12}
        />
      ) : (
        <Rect
          width={node.data.width}
          height={node.data.height}
          cornerRadius={12}
          fill="#fffdf8"
          stroke={isSelected ? "#0f766e" : "#1f2937"}
          strokeWidth={isSelected ? 2 : 1}
          shadowColor="#0f172a"
          shadowBlur={14}
          shadowOpacity={0.12}
        />
      )}

      <Text
        text={node.data.label}
        x={0}
        y={node.data.height / 2 - 14}
        width={node.data.width}
        align="center"
        fontSize={14}
        fontStyle="bold"
        fill="#1f2937"
      />

      {tableMeta ? (
        <Text
          text={tableMeta}
          x={0}
          y={node.data.height / 2 + 7}
          width={node.data.width}
          align="center"
          fontSize={8}
          fill="#64748b"
        />
      ) : null}

      {seatGeometries.map((seatGeometry, index) => {
        const seatKey = `${node.id}:${seatGeometry.seat.id}`;
        const isHovered = hoveredSeatKey === seatKey;
        const isOccupied = Boolean(seatGeometry.seat.occupiedBy);
        const showRemoveControl =
          isOccupied && Boolean(seatGeometry.seat.occupiedBy) && (isHovered || isSelected);
        const showDragHandle =
          isHovered && isOccupied && Boolean(seatGeometry.seat.occupiedBy);
        const localX = seatGeometry.x - node.position.x;
        const localY = seatGeometry.y - node.position.y;

        return (
          <Group
            key={seatGeometry.seat.id}
            x={localX}
            y={localY}
            onMouseEnter={() => onSeatHover(seatKey)}
            onMouseLeave={onSeatLeave}
          >
            {isOccupied ? (
              <Rect
                x={-18}
                y={-18}
                width={72}
                height={74}
                cornerRadius={18}
                fill="rgba(15,23,42,0.001)"
              />
            ) : null}
            <Circle
              x={15}
              y={15}
              radius={15}
              fill={isOccupied ? "#dcfce7" : "#e5e7eb"}
              stroke={isOccupied ? "#16a34a" : "#94a3b8"}
              strokeWidth={1.5}
            />
            <Text
              text={isOccupied ? "U" : "+"}
              x={0}
              y={7}
              width={30}
              align="center"
              fontSize={isOccupied ? 12 : 13}
              fontStyle="bold"
              fill={isOccupied ? "#166534" : "#6b7280"}
            />

            {isOccupied && seatGeometry.seat.occupiedByName ? (
              <Text
                text={seatGeometry.seat.occupiedByName}
                x={-26}
                y={index % 2 === 0 ? 34 : -28}
                width={82}
                align="center"
                fontSize={7}
                fill="#334155"
              />
            ) : null}

            {showDragHandle ? (
              <>
                <Rect
                  x={-14}
                  y={-13}
                  width={24}
                  height={24}
                  cornerRadius={7}
                  fill="#334155"
                  onMouseDown={(event) =>
                    onGuestHandleDown(
                      event,
                      seatGeometry.seat.occupiedBy!,
                      seatGeometry.seat.occupiedByName ?? "",
                      seatGeometry.seat.id,
                      node.id,
                    )
                  }
                />
                <Text
                  text="::"
                  x={-14}
                  y={-4}
                  width={24}
                  align="center"
                  fontSize={10}
                  fontStyle="bold"
                  fill="#ffffff"
                  listening={false}
                />
              </>
            ) : null}

            {showRemoveControl ? (
              <>
                <Circle
                  x={42}
                  y={4}
                  radius={10}
                  fill="#ef4444"
                  onMouseDown={(event) => {
                    event.cancelBubble = true;
                    onRemoveGuest(
                      node.id,
                      seatGeometry.seat.id,
                      seatGeometry.seat.occupiedBy!,
                    );
                  }}
                />
                <Text
                  text="x"
                  x={34}
                  y={-4}
                  width={16}
                  align="center"
                  fontSize={12}
                  fontStyle="bold"
                  fill="#ffffff"
                  listening={false}
                />
              </>
            ) : null}
          </Group>
        );
      })}
    </Group>
  );
}

interface ChairCanvasNodeProps extends SeatingCanvasNodeBaseProps {
  node: ChairPlannerNode;
}

function ChairCanvasNodeInner({
  node,
  isSelected,
  hoveredSeatKey,
  canInteract,
  onSelect,
  onDragMove,
  onDragEnd,
  onSeatHover,
  onSeatLeave,
  onGuestHandleDown,
  onRemoveGuest,
}: ChairCanvasNodeProps) {
  const seatGeometries = getSeatGeometries(node);

  return (
    <Group
      x={node.position.x}
      y={node.position.y}
      draggable={canInteract}
      onClick={(event) => {
        event.cancelBubble = true;
        onSelect(node.id);
      }}
      onTap={(event) => {
        event.cancelBubble = true;
        onSelect(node.id);
      }}
      onDragStart={(event) => {
        event.cancelBubble = true;
        onSelect(node.id);
      }}
      onDragMove={(event) =>
        onDragMove(node.id, { x: event.target.x(), y: event.target.y() })
      }
      onDragEnd={(event) =>
        onDragEnd(node.id, { x: event.target.x(), y: event.target.y() })
      }
    >
      <Rect
        width={node.data.width}
        height={node.data.height}
        cornerRadius={12}
        fill="#f8fafc"
        stroke={isSelected ? "#0f766e" : "#cbd5e1"}
        strokeWidth={isSelected ? 2 : 1}
        dash={[6, 4]}
      />
      <Text
        text={node.data.label}
        x={8}
        y={7}
        width={node.data.width - 16}
        fontSize={12}
        fontStyle="bold"
        fill="#334155"
      />

      {seatGeometries.map((chairGeometry) => {
        const seatKey = `${node.id}:${chairGeometry.seat.id}`;
        const isHovered = hoveredSeatKey === seatKey;
        const isOccupied = Boolean(chairGeometry.seat.occupiedBy);
        const showRemoveControl =
          isOccupied && Boolean(chairGeometry.seat.occupiedBy) && (isHovered || isSelected);
        const showDragHandle =
          isHovered && isOccupied && Boolean(chairGeometry.seat.occupiedBy);
        const localX = chairGeometry.x - node.position.x;
        const localY = chairGeometry.y - node.position.y;

        return (
          <Group
            key={chairGeometry.seat.id}
            x={localX}
            y={localY}
            onMouseEnter={() => onSeatHover(seatKey)}
            onMouseLeave={onSeatLeave}
          >
            {isOccupied ? (
              <Rect
                x={-18}
                y={-18}
                width={CHAIR_SIZE + 44}
                height={CHAIR_SIZE + 54}
                cornerRadius={18}
                fill="rgba(15,23,42,0.001)"
              />
            ) : null}
            <Rect
              width={CHAIR_SIZE}
              height={CHAIR_SIZE}
              cornerRadius={8}
              fill={isOccupied ? "#dcfce7" : "#f1f5f9"}
              stroke={isOccupied ? "#16a34a" : "#94a3b8"}
              strokeWidth={2}
            />
            <Text
              text={isOccupied ? "U" : "+"}
              x={0}
              y={11}
              width={CHAIR_SIZE}
              align="center"
              fontSize={isOccupied ? 14 : 16}
              fontStyle="bold"
              fill={isOccupied ? "#166534" : "#64748b"}
            />

            {isOccupied && chairGeometry.seat.occupiedByName ? (
              <Text
                text={chairGeometry.seat.occupiedByName}
                x={-24}
                y={CHAIR_SIZE + 4}
                width={CHAIR_SIZE + 48}
                align="center"
                fontSize={8}
                fill="#334155"
              />
            ) : null}

            {showDragHandle ? (
              <>
                <Rect
                  x={-14}
                  y={-13}
                  width={24}
                  height={24}
                  cornerRadius={7}
                  fill="#334155"
                  onMouseDown={(event) =>
                    onGuestHandleDown(
                      event,
                      chairGeometry.seat.occupiedBy!,
                      chairGeometry.seat.occupiedByName ?? "",
                      chairGeometry.seat.id,
                      node.id,
                    )
                  }
                />
                <Text
                  text="::"
                  x={-14}
                  y={-4}
                  width={24}
                  align="center"
                  fontSize={10}
                  fontStyle="bold"
                  fill="#ffffff"
                  listening={false}
                />
              </>
            ) : null}

            {showRemoveControl ? (
              <>
                <Circle
                  x={CHAIR_SIZE + 8}
                  y={4}
                  radius={10}
                  fill="#ef4444"
                  onMouseDown={(event) => {
                    event.cancelBubble = true;
                    onRemoveGuest(
                      node.id,
                      chairGeometry.seat.id,
                      chairGeometry.seat.occupiedBy!,
                    );
                  }}
                />
                <Text
                  text="x"
                  x={CHAIR_SIZE}
                  y={-4}
                  width={16}
                  align="center"
                  fontSize={12}
                  fontStyle="bold"
                  fill="#ffffff"
                  listening={false}
                />
              </>
            ) : null}
          </Group>
        );
      })}
    </Group>
  );
}

interface PlannerMiniMapProps {
  nodes: PlannerNode[];
  viewport: { x: number; y: number; zoom: number };
  stageSize: { width: number; height: number };
  venueWidthPx: number;
  venueHeightPx: number;
  className?: string;
}

function PlannerMiniMapInner({
  nodes,
  viewport,
  stageSize,
  venueWidthPx,
  venueHeightPx,
  className,
}: PlannerMiniMapProps) {
  const viewWidth = 180;
  const viewHeight = 120;
  const padding = 12;
  const initialBounds = {
    minX: 0,
    minY: 0,
    maxX: venueWidthPx,
    maxY: venueHeightPx,
  };
  const contentBounds = nodes.reduce(
    (bounds, node) => ({
      minX: Math.min(bounds.minX, node.position.x),
      minY: Math.min(bounds.minY, node.position.y),
      maxX: Math.max(bounds.maxX, node.position.x + getNodeWidth(node)),
      maxY: Math.max(bounds.maxY, node.position.y + getNodeHeight(node)),
    }),
    initialBounds,
  );

  const worldWidth = Math.max(1, contentBounds.maxX - contentBounds.minX);
  const worldHeight = Math.max(1, contentBounds.maxY - contentBounds.minY);
  const scale = Math.min(
    (viewWidth - padding * 2) / worldWidth,
    (viewHeight - padding * 2) / worldHeight,
  );

  const offsetX =
    (viewWidth - worldWidth * scale) / 2 - contentBounds.minX * scale;
  const offsetY =
    (viewHeight - worldHeight * scale) / 2 - contentBounds.minY * scale;

  const viewportRect = {
    x: (-viewport.x / viewport.zoom) * scale + offsetX,
    y: (-viewport.y / viewport.zoom) * scale + offsetY,
    width: (stageSize.width / viewport.zoom) * scale,
    height: (stageSize.height / viewport.zoom) * scale,
  };

  return (
    <div className={className}>
      <svg width={viewWidth} height={viewHeight} className="block">
        <rect
          x={offsetX}
          y={offsetY}
          width={venueWidthPx * scale}
          height={venueHeightPx * scale}
          rx={8}
          fill="#f8fafc"
          stroke="#cbd5e1"
        />
        {nodes.map((node) => (
          <rect
            key={node.id}
            x={node.position.x * scale + offsetX}
            y={node.position.y * scale + offsetY}
            width={Math.max(4, getNodeWidth(node) * scale)}
            height={Math.max(4, getNodeHeight(node) * scale)}
            rx={3}
            fill={
              node.type === "decorativeNode"
                ? "#94a3b8"
                : node.type === "chairNode"
                  ? "#86efac"
                  : "#facc15"
            }
            opacity={0.85}
          />
        ))}
        <rect
          x={viewportRect.x}
          y={viewportRect.y}
          width={viewportRect.width}
          height={viewportRect.height}
          rx={6}
          fill="none"
          stroke="#0f766e"
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}

export const DecorativeCanvasNode = memo(
  DecorativeCanvasNodeInner,
  (previous, next) =>
    previous.node === next.node &&
    previous.isSelected === next.isSelected &&
    previous.canInteract === next.canInteract,
);
DecorativeCanvasNode.displayName = "DecorativeCanvasNode";

export const TableCanvasNode = memo(
  TableCanvasNodeInner,
  (previous, next) =>
    previous.node === next.node &&
    previous.isSelected === next.isSelected &&
    previous.hoveredSeatKey === next.hoveredSeatKey &&
    previous.canInteract === next.canInteract,
);
TableCanvasNode.displayName = "TableCanvasNode";

export const ChairCanvasNode = memo(
  ChairCanvasNodeInner,
  (previous, next) =>
    previous.node === next.node &&
    previous.isSelected === next.isSelected &&
    previous.hoveredSeatKey === next.hoveredSeatKey &&
    previous.canInteract === next.canInteract,
);
ChairCanvasNode.displayName = "ChairCanvasNode";

export const PlannerMiniMap = memo(
  PlannerMiniMapInner,
  (previous, next) =>
    previous.nodes === next.nodes &&
    previous.viewport === next.viewport &&
    previous.stageSize === next.stageSize &&
    previous.venueWidthPx === next.venueWidthPx &&
    previous.venueHeightPx === next.venueHeightPx &&
    previous.className === next.className,
);
PlannerMiniMap.displayName = "PlannerMiniMap";
