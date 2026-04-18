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
import { CHAIR_SIZE, TABLE_SEAT_SIZE, type PlannerNode } from "./planner-types";
import {
  getDecorativeAsset,
  getNodeRotation,
  getNodeWorldBounds,
  getSeatGeometries,
} from "./planner-utils";

const ACCENT_COLOR = "#059669";
const ACCENT_GLOW = "rgba(5,150,105,0.16)";
const NEUTRAL_BORDER = "rgba(15,23,42,0.1)";
const TRANSITION_GHOST_FILL = "rgba(15,23,42,0.035)";

const getGuestInitials = (name: string | null) =>
  name
    ?.split(" ")
    .map((part) => part.trim()[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2) || "";

interface ExportTextBadgeProps {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

function ExportTextBadge({
  text,
  x,
  y,
  width,
  height,
  fontSize,
}: ExportTextBadgeProps) {
  return (
    <Group listening={false}>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        cornerRadius={Math.min(12, height / 2)}
        fill="rgba(255,255,255,0.97)"
        stroke="#cbd5e1"
        strokeWidth={1}
        shadowColor="#0f172a"
        shadowBlur={8}
        shadowOpacity={0.1}
      />
      <Text
        text={text}
        x={x + 6}
        y={y + 5}
        width={width - 12}
        height={height - 10}
        align="center"
        verticalAlign="middle"
        fontSize={fontSize}
        fontStyle="bold"
        fill="#0f172a"
        wrap="word"
        lineHeight={1.02}
        ellipsis
      />
    </Group>
  );
}

interface GuestSeatControlsProps {
  x: number;
  y: number;
  onDragHandleDown: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  onRemove: () => void;
}

function GuestSeatControls({
  x,
  y,
  onDragHandleDown,
  onRemove,
}: GuestSeatControlsProps) {
  return (
    <Group x={x} y={y}>
      <Rect
        width={64}
        height={24}
        cornerRadius={12}
        fill="rgba(255,255,255,0.98)"
        stroke="rgba(148,163,184,0.42)"
        strokeWidth={1}
        shadowColor="#0f172a"
        shadowBlur={12}
        shadowOpacity={0.14}
        shadowOffsetY={3}
      />
      <Rect
        x={4}
        y={4}
        width={26}
        height={16}
        cornerRadius={8}
        fill="rgba(5,150,105,0.11)"
        onMouseDown={(event) => {
          event.cancelBubble = true;
          onDragHandleDown(event);
        }}
      />
      {[0, 1, 2].flatMap((column) =>
        [0, 1].map((row) => (
          <Circle
            key={`drag-dot-${column}-${row}`}
            x={12 + column * 5}
            y={9 + row * 5}
            radius={1.2}
            fill="#047857"
            listening={false}
          />
        )),
      )}
      <Rect
        x={31.5}
        y={5}
        width={1}
        height={14}
        cornerRadius={1}
        fill="rgba(148,163,184,0.4)"
        listening={false}
      />
      <Rect
        x={34}
        y={4}
        width={26}
        height={16}
        cornerRadius={8}
        fill="rgba(244,63,94,0.1)"
        onMouseDown={(event) => {
          event.cancelBubble = true;
          onRemove();
        }}
      />
      <Text
        text="x"
        x={34}
        y={5}
        width={26}
        align="center"
        fontSize={10}
        fontStyle="bold"
        fill="#be123c"
        listening={false}
      />
    </Group>
  );
}

interface DecorativeCanvasNodeProps {
  node: DecorativePlannerNode;
  isSelected: boolean;
  canInteract: boolean;
  isExporting?: boolean;
  onSelect: (nodeId: string) => void;
  onDragMove: (nodeId: string, position: Point) => void;
  onDragEnd: (nodeId: string, position: Point) => void;
  onLineResizeStart: (nodeId: string, handle: LineResizeHandle) => void;
}

function DecorativeCanvasNodeInner({
  node,
  isSelected,
  canInteract,
  isExporting = false,
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
            shadowColor="#000000"
            shadowBlur={4}
            shadowOpacity={0.08}
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
            fontSize={isExporting ? 12 : 10}
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
  selectedSeatKey: string | null;
  canInteract: boolean;
  isExporting?: boolean;
  onSelect: (nodeId: string) => void;
  onDragMove: (nodeId: string, position: Point) => void;
  onDragEnd: (nodeId: string, position: Point) => void;
  onSeatHover: (seatKey: string) => void;
  onSeatLeave: () => void;
  onSeatSelect: (seatKey: string) => void;
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
  selectedSeatKey,
  canInteract,
  isExporting = false,
  onSelect,
  onDragMove,
  onDragEnd,
  onSeatHover,
  onSeatLeave,
  onSeatSelect,
  onGuestHandleDown,
  onRemoveGuest,
}: TableCanvasNodeProps) {
  const seatGeometries = getSeatGeometries(node);
  const isCircle =
    node.data.type === "circular" || node.data.type === "circular-single-seat";
  const rotation = getNodeRotation(node);
  const tableMeta =
    node.data.widthTable && node.data.heightTable && node.data.measurementType
      ? `${node.data.widthTable} x ${node.data.heightTable} ${node.data.measurementType}`
      : "";
  const tableLabelFontSize = isExporting ? 22 : 13;
  const tableMetaFontSize = isExporting ? 12 : 11;
  const seatNameFontSize = isExporting ? 10 : 7;
  const exportTableLabelWidth = Math.max(76, node.data.width - 28);
  const exportTableLabelX = (node.data.width - exportTableLabelWidth) / 2;
  const selectionGlowOffset = 4;
  const seatRadius = TABLE_SEAT_SIZE / 2;

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
      <Group
        x={node.data.width / 2}
        y={node.data.height / 2}
        offsetX={node.data.width / 2}
        offsetY={node.data.height / 2}
        rotation={rotation}
      >
        {isSelected ? (
          isCircle ? (
            <Circle
              x={node.data.width / 2}
              y={node.data.height / 2}
              radius={
                Math.min(node.data.width, node.data.height) / 2 + selectionGlowOffset
              }
              stroke={ACCENT_GLOW}
              strokeWidth={8}
              listening={false}
            />
          ) : (
            <Rect
              x={-selectionGlowOffset}
              y={-selectionGlowOffset}
              width={node.data.width + selectionGlowOffset * 2}
              height={node.data.height + selectionGlowOffset * 2}
              cornerRadius={12}
              stroke={ACCENT_GLOW}
              strokeWidth={8}
              listening={false}
            />
          )
        ) : null}

        {isCircle ? (
          <Circle
            x={node.data.width / 2}
            y={node.data.height / 2}
            radius={Math.min(node.data.width, node.data.height) / 2}
            fill="#ffffff"
            stroke={isSelected ? ACCENT_COLOR : NEUTRAL_BORDER}
            strokeWidth={isSelected ? 2 : 1}
            shadowColor="#000000"
            shadowBlur={8}
            shadowOffsetY={2}
            shadowOpacity={0.06}
          />
        ) : (
          <Rect
            width={node.data.width}
            height={node.data.height}
            cornerRadius={8}
            fill="#ffffff"
            stroke={isSelected ? ACCENT_COLOR : NEUTRAL_BORDER}
            strokeWidth={isSelected ? 2 : 1}
            shadowColor="#000000"
            shadowBlur={8}
            shadowOffsetY={2}
            shadowOpacity={0.06}
          />
        )}

        {isExporting ? (
          <Rect
            x={exportTableLabelX}
            y={node.data.height / 2 - 31}
            width={exportTableLabelWidth}
            height={28}
            cornerRadius={14}
            fill="rgba(255,255,255,0.94)"
            stroke="#e2e8f0"
            strokeWidth={1}
            shadowColor="#000000"
            shadowBlur={6}
            shadowOffsetY={2}
            shadowOpacity={0.05}
          />
        ) : null}

        <Text
          text={node.data.label}
          x={8}
          y={node.data.height / 2 - (tableMeta ? 18 : 9)}
          width={node.data.width - 16}
          align="center"
          fontSize={tableLabelFontSize}
          fontStyle="bold"
          fill="#0f172a"
          stroke={isExporting ? "#ffffff" : undefined}
          strokeWidth={isExporting ? 0.75 : 0}
          ellipsis
        />

        {tableMeta ? (
          <Text
            text={tableMeta}
            x={10}
            y={node.data.height / 2 + (isExporting ? 4 : 0)}
            width={node.data.width - 20}
            align="center"
            fontSize={tableMetaFontSize}
            fill={isExporting ? "#475569" : "rgba(15,23,42,0.58)"}
            fontStyle={isExporting ? "bold" : "normal"}
            ellipsis
          />
        ) : null}

        {seatGeometries.map((seatGeometry, index) => {
          const seatKey = `${node.id}:${seatGeometry.seat.id}`;
          const isHovered = hoveredSeatKey === seatKey;
          const isSelectedSeat = selectedSeatKey === seatKey;
          const isOccupied = Boolean(seatGeometry.seat.occupiedBy);
          const showRemoveControl =
            isOccupied && Boolean(seatGeometry.seat.occupiedBy) && (isHovered || isSelectedSeat);
          const showDragHandle =
            isOccupied && Boolean(seatGeometry.seat.occupiedBy) && (isHovered || isSelectedSeat);
          const localX = seatGeometry.x - node.position.x;
          const localY = seatGeometry.y - node.position.y;
          const initials = getGuestInitials(seatGeometry.seat.occupiedByName);

          return (
            <Group
              key={seatGeometry.seat.id}
              x={localX}
              y={localY}
              onMouseEnter={() => onSeatHover(seatKey)}
              onMouseLeave={onSeatLeave}
              onClick={(event) => {
                event.cancelBubble = true;
                onSelect(node.id);
                onSeatSelect(seatKey);
              }}
              onTap={(event) => {
                event.cancelBubble = true;
                onSelect(node.id);
                onSeatSelect(seatKey);
              }}
            >
              {isHovered || isSelectedSeat ? (
                <Rect
                  x={-10}
                  y={-10}
                  width={TABLE_SEAT_SIZE + 20}
                  height={TABLE_SEAT_SIZE + 20}
                  cornerRadius={18}
                  fill={isSelectedSeat ? "rgba(5,150,105,0.08)" : TRANSITION_GHOST_FILL}
                />
              ) : null}

              {isSelectedSeat ? (
                <Circle
                  x={seatRadius}
                  y={seatRadius}
                  radius={seatRadius + 3}
                  stroke={ACCENT_COLOR}
                  strokeWidth={2}
                  listening={false}
                />
              ) : null}

              <Circle
                x={seatRadius}
                y={seatRadius}
                radius={seatRadius}
                fill={isOccupied ? "#ecfdf5" : "#f3f4f6"}
                stroke={isOccupied ? "rgba(5,150,105,0.28)" : NEUTRAL_BORDER}
                strokeWidth={1}
              />
              <Text
                text={isOccupied ? initials || "G" : "+"}
                x={0}
                y={isOccupied ? 9 : 7}
                width={TABLE_SEAT_SIZE}
                align="center"
                fontSize={isOccupied ? 10 : 12}
                fontStyle="bold"
                fill={isOccupied ? "#065f46" : "rgba(15,23,42,0.42)"}
                ellipsis
              />

              {isOccupied && seatGeometry.seat.occupiedByName && isExporting ? (
                <ExportTextBadge
                  text={seatGeometry.seat.occupiedByName}
                  x={-40}
                  y={index % 2 === 0 ? 34 : -36}
                  width={110}
                  height={30}
                  fontSize={seatNameFontSize}
                />
              ) : null}

              {showDragHandle || showRemoveControl ? (
                <GuestSeatControls
                  x={seatRadius - 32}
                  y={-34}
                  onDragHandleDown={(event) =>
                    onGuestHandleDown(
                      event,
                      seatGeometry.seat.occupiedBy!,
                      seatGeometry.seat.occupiedByName ?? "",
                      seatGeometry.seat.id,
                      node.id,
                    )
                  }
                  onRemove={() =>
                    onRemoveGuest(
                      node.id,
                      seatGeometry.seat.id,
                      seatGeometry.seat.occupiedBy!,
                    )
                  }
                />
              ) : null}
            </Group>
          );
        })}
      </Group>
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
  selectedSeatKey,
  canInteract,
  isExporting = false,
  onSelect,
  onDragMove,
  onDragEnd,
  onSeatHover,
  onSeatLeave,
  onSeatSelect,
  onGuestHandleDown,
  onRemoveGuest,
}: ChairCanvasNodeProps) {
  const seatGeometries = getSeatGeometries(node);
  const rotation = getNodeRotation(node);
  const chairLabelFontSize = isExporting ? 15 : 12;
  const chairGuestNameFontSize = isExporting ? 10 : 8;
  const seatRadius = TABLE_SEAT_SIZE / 2;

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
      <Group
        x={node.data.width / 2}
        y={node.data.height / 2}
        offsetX={node.data.width / 2}
        offsetY={node.data.height / 2}
        rotation={rotation}
      >
        {isSelected ? (
          <Rect
            x={-4}
            y={-4}
            width={node.data.width + 8}
            height={node.data.height + 8}
            cornerRadius={16}
            stroke={ACCENT_GLOW}
            strokeWidth={8}
            listening={false}
          />
        ) : null}
        <Rect
          width={node.data.width}
          height={node.data.height}
          cornerRadius={12}
          fill="#ffffff"
          stroke={isSelected ? ACCENT_COLOR : NEUTRAL_BORDER}
          strokeWidth={isSelected ? 2 : 1}
          dash={[6, 4]}
        />
        <Text
          text={node.data.label}
          x={8}
          y={7}
          width={node.data.width - 16}
          fontSize={chairLabelFontSize}
          fontStyle="bold"
          fill="#334155"
          ellipsis
        />

        {seatGeometries.map((chairGeometry) => {
          const seatKey = `${node.id}:${chairGeometry.seat.id}`;
          const isHovered = hoveredSeatKey === seatKey;
          const isSelectedSeat = selectedSeatKey === seatKey;
          const isOccupied = Boolean(chairGeometry.seat.occupiedBy);
          const showRemoveControl =
            isOccupied && Boolean(chairGeometry.seat.occupiedBy) && (isHovered || isSelectedSeat);
          const showDragHandle =
            isOccupied && Boolean(chairGeometry.seat.occupiedBy) && (isHovered || isSelectedSeat);
          const localX = chairGeometry.x - node.position.x;
          const localY = chairGeometry.y - node.position.y;
          const initials = getGuestInitials(chairGeometry.seat.occupiedByName);

          return (
            <Group
              key={chairGeometry.seat.id}
              x={localX}
              y={localY}
              onMouseEnter={() => onSeatHover(seatKey)}
              onMouseLeave={onSeatLeave}
              onClick={(event) => {
                event.cancelBubble = true;
                onSelect(node.id);
                onSeatSelect(seatKey);
              }}
              onTap={(event) => {
                event.cancelBubble = true;
                onSelect(node.id);
                onSeatSelect(seatKey);
              }}
            >
              {isHovered || isSelectedSeat ? (
                <Rect
                  x={-6}
                  y={-6}
                  width={CHAIR_SIZE + 12}
                  height={CHAIR_SIZE + 12}
                  cornerRadius={16}
                  fill={isSelectedSeat ? "rgba(5,150,105,0.08)" : TRANSITION_GHOST_FILL}
                />
              ) : null}
              <Rect
                width={CHAIR_SIZE}
                height={CHAIR_SIZE}
                cornerRadius={10}
                fill="#f8fafc"
                stroke={NEUTRAL_BORDER}
                strokeWidth={1}
              />
              {isSelectedSeat ? (
                <Circle
                  x={CHAIR_SIZE / 2}
                  y={CHAIR_SIZE / 2}
                  radius={seatRadius + 3}
                  stroke={ACCENT_COLOR}
                  strokeWidth={2}
                  listening={false}
                />
              ) : null}
              {isOccupied ? (
                <>
                  <Circle
                    x={CHAIR_SIZE / 2}
                    y={CHAIR_SIZE / 2}
                    radius={seatRadius}
                    fill="#ecfdf5"
                    stroke="rgba(5,150,105,0.28)"
                    strokeWidth={1}
                  />
                  <Text
                    text={initials || "G"}
                    x={(CHAIR_SIZE - TABLE_SEAT_SIZE) / 2}
                    y={CHAIR_SIZE / 2 - 5}
                    width={TABLE_SEAT_SIZE}
                    align="center"
                    fontSize={10}
                    fontStyle="bold"
                    fill="#065f46"
                  />
                </>
              ) : (
                <Text
                  text="+"
                  x={0}
                  y={11}
                  width={CHAIR_SIZE}
                  align="center"
                  fontSize={16}
                  fontStyle="bold"
                  fill="rgba(15,23,42,0.42)"
                />
              )}

              {isOccupied && chairGeometry.seat.occupiedByName && isExporting ? (
                <ExportTextBadge
                  text={chairGeometry.seat.occupiedByName}
                  x={-36}
                  y={CHAIR_SIZE + 4}
                  width={CHAIR_SIZE + 72}
                  height={30}
                  fontSize={chairGuestNameFontSize}
                />
              ) : null}

              {showDragHandle || showRemoveControl ? (
                <GuestSeatControls
                  x={CHAIR_SIZE / 2 - 32}
                  y={-32}
                  onDragHandleDown={(event) =>
                    onGuestHandleDown(
                      event,
                      chairGeometry.seat.occupiedBy!,
                      chairGeometry.seat.occupiedByName ?? "",
                      chairGeometry.seat.id,
                      node.id,
                    )
                  }
                  onRemove={() =>
                    onRemoveGuest(
                      node.id,
                      chairGeometry.seat.id,
                      chairGeometry.seat.occupiedBy!,
                    )
                  }
                />
              ) : null}
            </Group>
          );
        })}
      </Group>
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
    (bounds, node) => {
      const nodeBounds = getNodeWorldBounds(node);

      return {
        minX: Math.min(bounds.minX, nodeBounds.left),
        minY: Math.min(bounds.minY, nodeBounds.top),
        maxX: Math.max(bounds.maxX, nodeBounds.right),
        maxY: Math.max(bounds.maxY, nodeBounds.bottom),
      };
    },
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
          (() => {
            const nodeBounds = getNodeWorldBounds(node);

            return (
              <rect
                key={node.id}
                x={nodeBounds.left * scale + offsetX}
                y={nodeBounds.top * scale + offsetY}
                width={Math.max(4, (nodeBounds.right - nodeBounds.left) * scale)}
                height={Math.max(4, (nodeBounds.bottom - nodeBounds.top) * scale)}
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
            );
          })()
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
    previous.canInteract === next.canInteract &&
    previous.isExporting === next.isExporting,
);
DecorativeCanvasNode.displayName = "DecorativeCanvasNode";

export const TableCanvasNode = memo(
  TableCanvasNodeInner,
  (previous, next) =>
    previous.node === next.node &&
    previous.isSelected === next.isSelected &&
    previous.hoveredSeatKey === next.hoveredSeatKey &&
    previous.selectedSeatKey === next.selectedSeatKey &&
    previous.canInteract === next.canInteract &&
    previous.isExporting === next.isExporting,
);
TableCanvasNode.displayName = "TableCanvasNode";

export const ChairCanvasNode = memo(
  ChairCanvasNodeInner,
  (previous, next) =>
    previous.node === next.node &&
    previous.isSelected === next.isSelected &&
    previous.hoveredSeatKey === next.hoveredSeatKey &&
    previous.selectedSeatKey === next.selectedSeatKey &&
    previous.canInteract === next.canInteract &&
    previous.isExporting === next.isExporting,
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
