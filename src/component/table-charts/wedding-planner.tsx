"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import { Group, Layer, Line, Rect, Stage } from "react-konva";
import { useIdleTimer } from "react-idle-timer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { jsPDF } from "jspdf";
import { Menu } from "lucide-react";
import { toast } from "sonner";
import type { Guest } from "@/@types/events-details";
import {
  deleteDecorator,
  deleteGuest,
  deleteSeatPlan,
  getAllGuest,
  getAllSeatPlan,
  getDecorator,
  getHeader,
  postDecorator,
  postSeatPlan,
  updateBulkGuest,
  updateDecorator,
  updateSeatPlan,
} from "@/actions/fetch-action";
import { Button } from "@/components/ui/button";
import { useStore } from "@/zustan-fn/save-alert";
import ZoomResponsiveBoundary from "./ZoomResponsiveBoundary";
import {
  ChairCanvasNode,
  DecorativeCanvasNode,
  PlannerMiniMap,
  TableCanvasNode,
} from "./planner-canvas";
import { PlannerAddItemDialog, PlannerEditDialog } from "./planner-dialogs";
import {
  PlannerActionBar,
  PlannerEmptyState,
  PlannerExportOverlay,
  PlannerLoadingSkeleton,
  PlannerSelectionActions,
  PlannerViewportControls,
} from "./planner-overlays";
import { Sidebar } from "./sidebar";
import { usePlannerActions } from "./use-planner-actions";
import type {
  ChangedObjects, DecorativePlannerNode, EditDialogState, GuestDragState,
  LineResizeState, PersistedDecorativeNode, PersistedSeatPlanNode, PlannerNode,
  PlannerViewport, Point, SeatHitTarget, SeatingPlannerNode, TableType,
} from "./planner-types";
import { FOCUS_ZOOM, GRID_GAP, LARGE_CANVAS_SIZE, MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from "./planner-types";
import {
  clamp, getNodeHeight, getNodeWidth, getSeatGeometries, hydrateDecorativeNode,
  hydrateSeatPlanNode, isChairNode, isTableNode, loadImageElement,
  serializeDecorativeNode, serializeSeatPlanNode,
} from "./planner-utils";

export type { TableNodeData, TableType } from "./planner-types";
export { getRectangularSeatDistribution } from "./planner-utils";

const PDF_EXPORT_TARGET_MAX_PIXELS = 6200;
const PDF_EXPORT_MIN_PIXEL_RATIO = 5;
const PDF_EXPORT_MAX_PIXEL_RATIO = 8;
const PDF_EXPORT_MARGIN_MM = 14;
const PDF_EXPORT_TOP_MARGIN_MM = 12;
const PDF_EXPORT_FOOTER_MM = 12;
const PDF_EXPORT_TITLE_LINE_HEIGHT_MM = 8;
const PDF_POINT_TO_MM = 0.352778;

const convertImageToPngDataUrl = (image: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to convert image for PDF.");
  }

  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/png");
};

const getPdfImageFormatFromSource = (src: string) => {
  const normalized = src.toLowerCase().split("?")[0];

  if (
    normalized.endsWith(".png") ||
    normalized.endsWith(".svg") ||
    normalized.startsWith("data:image/png") ||
    normalized.startsWith("data:image/svg")
  ) {
    return "PNG" as const;
  }

  if (
    normalized.endsWith(".webp") ||
    normalized.startsWith("data:image/webp")
  ) {
    return "WEBP" as const;
  }

  return "JPEG" as const;
};

interface PdfTextBadge {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontStyle?: "normal" | "bold";
  maxLines?: number;
  fillColor?: [number, number, number];
  strokeColor?: [number, number, number];
  textColor?: [number, number, number];
}

const drawPdfTextBadge = (pdf: jsPDF, badge: PdfTextBadge) => {
  if (!badge.text.trim() || badge.width <= 2 || badge.height <= 2) {
    return;
  }

  const fillColor = badge.fillColor ?? [255, 255, 255];
  const strokeColor = badge.strokeColor ?? [203, 213, 225];
  const textColor = badge.textColor ?? [15, 23, 42];
  const horizontalPadding = Math.min(2.4, badge.width * 0.12);
  const verticalPadding = Math.min(1.5, badge.height * 0.18);
  const innerWidth = Math.max(1, badge.width - horizontalPadding * 2);
  const innerHeight = Math.max(1, badge.height - verticalPadding * 2);
  const fontSize = Math.max(7, Math.min(12, badge.height * 1.15));
  const lineHeight = fontSize * PDF_POINT_TO_MM * 0.92;
  const rawLines = pdf.splitTextToSize(badge.text.trim(), innerWidth);
  const rawLineList = Array.isArray(rawLines) ? rawLines : [rawLines];
  const maxLines = badge.maxLines ?? Math.max(1, Math.floor(innerHeight / lineHeight));
  const lines = rawLineList.slice(0, maxLines);

  if (rawLineList.length > maxLines && lines.length > 0) {
    const lastLine = lines[lines.length - 1]!.replace(/\s+\S*$/, "").trimEnd();
    lines[lines.length - 1] = `${lastLine || lines[lines.length - 1]}...`;
  }

  const totalTextHeight = lines.length * lineHeight;
  const textStartY =
    badge.y + (badge.height - totalTextHeight) / 2 + lineHeight * 0.78;
  const radius = Math.min(2.2, badge.height / 2);

  pdf.setFillColor(...fillColor);
  pdf.setDrawColor(...strokeColor);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(
    badge.x,
    badge.y,
    badge.width,
    badge.height,
    radius,
    radius,
    "FD",
  );
  pdf.setFont("helvetica", badge.fontStyle ?? "bold");
  pdf.setFontSize(fontSize);
  pdf.setTextColor(...textColor);
  pdf.text(lines, badge.x + badge.width / 2, textStartY, {
    align: "center",
  });
};

function WeddingPlanner() {
  const query = useSearchParams();
  const pathname = usePathname();
  const eventId = pathname.split("/").pop() as string;
  const queryClient = useQueryClient();
  const setDirtyCount = useStore((state) => state.setDataLength);

  const venueWidth = parseFloat(query.get("venueWidth") || "50");
  const venueHeight = parseFloat(query.get("venueHeight") || "30");
  const SCALE_FACTOR = 19;
  const venueWidthPx = venueWidth * SCALE_FACTOR * 5;
  const venueHeightPx = venueHeight * SCALE_FACTOR * 5;
  const estimatedCapacity = Math.floor((venueWidth * venueHeight) / 25);

  const [nodes, setNodes] = useState<PlannerNode[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<PlannerViewport>({
    x: 0,
    y: 0,
    zoom: MIN_ZOOM,
  });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [showSidebar, setShowSidebar] = useState(true);
  const [hoveredSeatKey, setHoveredSeatKey] = useState<string | null>(null);
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [newTableType, setNewTableType] = useState<TableType | null>(null);
  const [newTableNumSeats, setNewTableNumSeats] = useState(8);
  const [newTableLabel, setNewTableLabel] = useState("");
  const [measurementType, setMeasurementType] = useState("");
  const [tableWidthInput, setTableWidthInput] = useState(0);
  const [tableHeightInput, setTableHeightInput] = useState(0);
  const [editDialogState, setEditDialogState] = useState<EditDialogState | null>(
    null,
  );
  const [hasHydratedInitialPlanner, setHasHydratedInitialPlanner] = useState(false);
  const [changedObjects, setChangedObjects] = useState<ChangedObjects>({
    guest: [],
    node: [],
    decorativeItems: [],
  });
  const [guestDragState, setGuestDragState] = useState<GuestDragState | null>(
    null,
  );
  const [lineResizeState, setLineResizeState] = useState<LineResizeState | null>(
    null,
  );
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [panState, setPanState] = useState<{
    startClientX: number;
    startClientY: number;
    startViewportX: number;
    startViewportY: number;
  } | null>(null);

  const viewportRef = useRef(viewport);
  const nodesRef = useRef(nodes);
  const guestsRef = useRef(guests);
  const stageRef = useRef<Konva.Stage | null>(null);
  const boundaryStageRef = useRef<Konva.Stage | null>(null);
  const plannerViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    guestsRef.current = guests;
  }, [guests]);

  useEffect(() => {
    const total =
      changedObjects.guest.length +
      changedObjects.node.length +
      changedObjects.decorativeItems.length;
    setDirtyCount(total);
  }, [changedObjects, setDirtyCount]);

  useEffect(() => {
    const element = plannerViewportRef.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      setStageSize({
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      });
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const { data: guestResponse, isPending: isGuestPending } = useQuery({
    queryKey: ["get-all-guest", eventId],
    queryFn: () => getAllGuest(eventId),
  });

  const { data: seatPlanResponse, isPending: isSeatPlanPending } = useQuery({
    queryKey: ["seat-plan", eventId],
    queryFn: () => getAllSeatPlan(eventId),
  });

  const { data: decoratorResponse, isPending: isDecoratorPending } = useQuery({
    queryKey: ["seat-plan-decorator", eventId],
    queryFn: () => getDecorator(eventId),
  });

  const { data: companyInfo } = useQuery({
    queryKey: ["header"],
    queryFn: () => getHeader(),
    gcTime: 1000 * 60 * 60,
  });

  const clearTrackedNode = useCallback((nodeId: string) => {
    setChangedObjects((previous) => ({
      ...previous,
      node: previous.node.filter((item) => item.id !== nodeId),
    }));
  }, []);

  const clearTrackedGuest = useCallback((guestId: string) => {
    setChangedObjects((previous) => ({
      ...previous,
      guest: previous.guest.filter((guest) => guest._id !== guestId),
    }));
  }, []);

  const clearTrackedDecorative = useCallback((nodeId: string) => {
    setChangedObjects((previous) => ({
      ...previous,
      decorativeItems: previous.decorativeItems.filter(
        (item) => item.id !== nodeId,
      ),
    }));
  }, []);

  const trackGuestChange = useCallback((guest: Guest) => {
    setChangedObjects((previous) => ({
      ...previous,
      guest: [
        ...previous.guest.filter((item) => item._id !== guest._id),
        guest,
      ],
    }));
  }, []);

  const trackSeatPlanChange = useCallback((node: SeatingPlannerNode) => {
    const serialized = serializeSeatPlanNode(node);

    setChangedObjects((previous) => ({
      ...previous,
      node: [
        ...previous.node.filter((item) => item.id !== node.id),
        serialized,
      ],
    }));
  }, []);

  const trackDecorativeChange = useCallback((node: DecorativePlannerNode) => {
    const serialized = serializeDecorativeNode(node);

    setChangedObjects((previous) => ({
      ...previous,
      decorativeItems: [
        ...previous.decorativeItems.filter((item) => item.id !== node.id),
        serialized,
      ],
    }));
  }, []);

  const { mutate: createSeatPlanNode } = useMutation({
    mutationKey: ["added-new-seat-plan"],
    mutationFn: (payload: PersistedSeatPlanNode) =>
      postSeatPlan(payload as unknown as Record<string, unknown>),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error.message);
      }
    },
  });

  const { mutate: updateSeatPlanNodes } = useMutation({
    mutationKey: ["update-seat-plan"],
    mutationFn: (payload: PersistedSeatPlanNode[]) =>
      updateSeatPlan(payload as unknown as Record<string, unknown>),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error.message);
        return;
      }

      toast.success("Guest sit plan updated successfully");
      setChangedObjects((previous) => ({ ...previous, node: [] }));
    },
  });

  const { mutate: deleteSeatPlanNode } = useMutation({
    mutationKey: ["delete-seat-plan"],
    mutationFn: (nodeId: string) => deleteSeatPlan(nodeId),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error.message);
      }
    },
  });

  const { mutate: createDecorativeNode } = useMutation({
    mutationKey: ["create-decorative-node"],
    mutationFn: (payload: PersistedDecorativeNode) =>
      postDecorator(payload as unknown as Record<string, unknown>),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error.message);
      }
    },
  });

  const { mutate: updateDecorativeNodes } = useMutation({
    mutationKey: ["update-decorative-nodes"],
    mutationFn: (payload: PersistedDecorativeNode[]) =>
      updateDecorator(payload as unknown as Record<string, unknown>[]),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error.message);
        return;
      }

      setChangedObjects((previous) => ({ ...previous, decorativeItems: [] }));
    },
  });

  const { mutate: deleteDecorativeNodeMutation } = useMutation({
    mutationKey: ["delete-decorative-node"],
    mutationFn: (nodeId: string) => deleteDecorator(nodeId),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error.message);
      }
    },
  });

  const { mutate: updateAllGuests } = useMutation({
    mutationKey: ["update-all-guests"],
    mutationFn: (payload: Guest[]) => updateBulkGuest(payload),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error.message);
        return;
      }

      toast.success("Guest updated successfully");
      setChangedObjects((previous) => ({ ...previous, guest: [] }));
    },
  });

  const { mutate: deleteGuestMutation } = useMutation({
    mutationKey: ["delete-guest"],
    mutationFn: (guestId: string) => deleteGuest(guestId),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error.message);
        return;
      }

      queryClient.refetchQueries({
        queryKey: ["get-all-guest"],
        exact: false,
      });
      toast.success("Guest deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const getViewportForBounds = useCallback(
    (bounds: { minX: number; minY: number; maxX: number; maxY: number }) => {
      const width = Math.max(1, bounds.maxX - bounds.minX);
      const height = Math.max(1, bounds.maxY - bounds.minY);
      const padding = 80;

      const effectiveWidth = Math.max(1, stageSize.width - padding);
      const effectiveHeight = Math.max(1, stageSize.height - padding);
      const zoom = clamp(
        Math.min(effectiveWidth / width, effectiveHeight / height, 1),
        MIN_ZOOM,
        MAX_ZOOM,
      );

      return {
        x: (stageSize.width - width * zoom) / 2 - bounds.minX * zoom,
        y: (stageSize.height - height * zoom) / 2 - bounds.minY * zoom,
        zoom,
      };
    },
    [stageSize.height, stageSize.width],
  );

  const getContentBounds = useCallback(
    (items: PlannerNode[]) =>
      items.reduce(
        (bounds, node) => ({
          minX: Math.min(bounds.minX, node.position.x - 60),
          minY: Math.min(bounds.minY, node.position.y - 60),
          maxX: Math.max(bounds.maxX, node.position.x + getNodeWidth(node) + 60),
          maxY: Math.max(bounds.maxY, node.position.y + getNodeHeight(node) + 60),
        }),
        {
          minX: -40,
          minY: -40,
          maxX: venueWidthPx + 40,
          maxY: venueHeightPx + 40,
        },
      ),
    [venueHeightPx, venueWidthPx],
  );

  const fitToContent = useCallback(() => {
    const nextViewport = getViewportForBounds(getContentBounds(nodesRef.current));
    setViewport(nextViewport);
  }, [getContentBounds, getViewportForBounds]);

  const getInitialViewport = useCallback(
    () =>
      getViewportForBounds({
        minX: 0,
        minY: 0,
        maxX: venueWidthPx,
        maxY: venueHeightPx,
      }),
    [getViewportForBounds, venueHeightPx, venueWidthPx],
  );

  const zoomToNode = useCallback(
    (position: Point) => {
      const targetZoom = FOCUS_ZOOM;
      setViewport({
        x: stageSize.width / 2 - position.x * targetZoom,
        y: stageSize.height / 2 - position.y * targetZoom,
        zoom: targetZoom,
      });
    },
    [stageSize.height, stageSize.width],
  );

  const worldToScreen = useCallback(
    (point: Point) => ({
      x: point.x * viewport.zoom + viewport.x,
      y: point.y * viewport.zoom + viewport.y,
    }),
    [viewport],
  );

  const clientToWorld = useCallback((clientX: number, clientY: number) => {
    const rect = plannerViewportRef.current?.getBoundingClientRect();

    if (!rect) {
      return null;
    }

    return {
      x: (clientX - rect.left - viewportRef.current.x) / viewportRef.current.zoom,
      y: (clientY - rect.top - viewportRef.current.y) / viewportRef.current.zoom,
    };
  }, []);

  useEffect(() => {
    if (guestResponse?.data) {
      setGuests(guestResponse.data as Guest[]);
    }
  }, [guestResponse?.data]);

  useEffect(() => {
    setHasHydratedInitialPlanner(false);
  }, [eventId]);

  useEffect(() => {
    if (!stageSize.width || !stageSize.height) {
      return;
    }

    const hydratedNodes: PlannerNode[] = [];

    if (Array.isArray(seatPlanResponse?.data)) {
      hydratedNodes.push(
        ...seatPlanResponse.data.map((node) =>
          hydrateSeatPlanNode(
            node as unknown as Parameters<typeof hydrateSeatPlanNode>[0],
          ),
        ),
      );
    }

    if (Array.isArray(decoratorResponse?.data)) {
      hydratedNodes.push(
        ...decoratorResponse.data.map((node) =>
          hydrateDecorativeNode(
            node as unknown as Parameters<typeof hydrateDecorativeNode>[0],
          ),
        ),
      );
    }

    setNodes(hydratedNodes);
    setSelectedNodeId(null);
    setViewport(getInitialViewport());
    setHasHydratedInitialPlanner(true);
  }, [
    decoratorResponse?.data,
    getInitialViewport,
    seatPlanResponse?.data,
    stageSize.height,
    stageSize.width,
  ]);

  const isInitialPlannerLoading =
    isGuestPending ||
    isSeatPlanPending ||
    isDecoratorPending ||
    !stageSize.width ||
    !stageSize.height ||
    !hasHydratedInitialPlanner;

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const selectedNodeActionStyle = useMemo(() => {
    if (!selectedNode) {
      return null;
    }

    const anchor =
      selectedNode.type === "decorativeNode"
        ? {
            x: selectedNode.position.x + selectedNode.data.width / 2,
            y: selectedNode.position.y - 20,
          }
        : {
            x: selectedNode.position.x + selectedNode.data.width / 2,
            y: selectedNode.position.y + selectedNode.data.height + 20,
          };

    const screen = worldToScreen(anchor);

    return {
      left: screen.x,
      top: screen.y,
      transform: "translate(-50%, -50%)",
    } as const;
  }, [selectedNode, worldToScreen]);

  const findSeatTarget = useCallback((point: Point): SeatHitTarget | null => {
    const seatingNodes = nodesRef.current.filter(
      (node): node is SeatingPlannerNode => node.type !== "decorativeNode",
    );

    for (let nodeIndex = seatingNodes.length - 1; nodeIndex >= 0; nodeIndex -= 1) {
      const node = seatingNodes[nodeIndex];
      const seatGeometries = getSeatGeometries(node);

      for (let seatIndex = seatGeometries.length - 1; seatIndex >= 0; seatIndex -= 1) {
        const seatGeometry = seatGeometries[seatIndex];

        if (
          point.x >= seatGeometry.x &&
          point.x <= seatGeometry.x + seatGeometry.width &&
          point.y >= seatGeometry.y &&
          point.y <= seatGeometry.y + seatGeometry.height
        ) {
          return { nodeId: node.id, seatId: seatGeometry.seat.id };
        }
      }
    }

    return null;
  }, []);

  const {
    handleAddTableClick,
    handleConfirmAddTable,
    handleDeleteDecorative,
    handleDeleteSeatPlanNode,
    handleDrop,
    handleEditConfirm,
    handleGuestHandleDown,
    handleLineResizeStart,
    handleNodeDragEnd,
    handleNodeDragMove,
    handleRemoveGuest,
    handleRemoveGuestFromSeat,
    openEditDialog,
  } = usePlannerActions({
    clientToWorld,
    clearTrackedDecorative,
    clearTrackedGuest,
    clearTrackedNode,
    createDecorativeNode,
    createSeatPlanNode,
    deleteDecorativeNodeMutation,
    deleteGuestMutation,
    deleteSeatPlanNode,
    editDialogState,
    eventId,
    findSeatTarget,
    guestsRef,
    guestDragState,
    lineResizeState,
    measurementType,
    newTableLabel,
    newTableNumSeats,
    newTableType,
    nodesRef,
    setEditDialogState,
    setGuests,
    setGuestDragState,
    setIsAddTableDialogOpen,
    setLineResizeState,
    setMeasurementType,
    setNewTableLabel,
    setNewTableNumSeats,
    setNewTableType,
    setNodes,
    setSelectedNodeId,
    setTableHeightInput,
    setTableWidthInput,
    stageRef,
    tableHeightInput,
    tableWidthInput,
    trackDecorativeChange,
    trackGuestChange,
    trackSeatPlanChange,
    venueHeightPx,
    venueWidthPx,
    viewportRef,
    zoomToNode,
  });

  const handleWheel = useCallback((event: Konva.KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();

    const pointer = stageRef.current?.getPointerPosition();

    if (!pointer) {
      return;
    }

    const oldZoom = viewportRef.current.zoom;
    const direction = event.evt.deltaY > 0 ? -1 : 1;
    const scaleFactor = direction > 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
    const nextZoom = clamp(oldZoom * scaleFactor, MIN_ZOOM, MAX_ZOOM);

    const worldX = (pointer.x - viewportRef.current.x) / oldZoom;
    const worldY = (pointer.y - viewportRef.current.y) / oldZoom;

    setViewport({
      zoom: nextZoom,
      x: pointer.x - worldX * nextZoom,
      y: pointer.y - worldY * nextZoom,
    });
  }, []);

  useEffect(() => {
    if (!panState) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      setViewport((previous) => ({
        ...previous,
        x: panState.startViewportX + (event.clientX - panState.startClientX),
        y: panState.startViewportY + (event.clientY - panState.startClientY),
      }));
    };

    const handleMouseUp = () => setPanState(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [panState]);

  const handleStageMouseDown = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent>) => {
      const targetName = event.target?.name?.() ?? "";
      const clickedEmpty =
        event.target === event.target.getStage() ||
        targetName === "planner-background";

      if (!clickedEmpty || guestDragState || lineResizeState) {
        return;
      }

      setSelectedNodeId(null);
      setPanState({
        startClientX: event.evt.clientX,
        startClientY: event.evt.clientY,
        startViewportX: viewportRef.current.x,
        startViewportY: viewportRef.current.y,
      });
    },
    [guestDragState, lineResizeState],
  );

  const visibleWorldBounds = useMemo(() => {
    const left = -viewport.x / viewport.zoom;
    const top = -viewport.y / viewport.zoom;
    const right = left + stageSize.width / viewport.zoom;
    const bottom = top + stageSize.height / viewport.zoom;

    return { left, top, right, bottom };
  }, [stageSize.height, stageSize.width, viewport]);

  const gridLines = useMemo(() => {
    const lines: Array<{ points: number[] }> = [];

    const startX =
      Math.floor((visibleWorldBounds.left - GRID_GAP * 4) / GRID_GAP) * GRID_GAP;
    const endX = visibleWorldBounds.right + GRID_GAP * 4;
    const startY =
      Math.floor((visibleWorldBounds.top - GRID_GAP * 4) / GRID_GAP) * GRID_GAP;
    const endY = visibleWorldBounds.bottom + GRID_GAP * 4;

    for (let x = startX; x <= endX; x += GRID_GAP) {
      lines.push({ points: [x, startY, x, endY] });
    }

    for (let y = startY; y <= endY; y += GRID_GAP) {
      lines.push({ points: [startX, y, endX, y] });
    }

    return lines;
  }, [visibleWorldBounds]);

  const handleSaveChanges = useCallback(() => {
    const total =
      changedObjects.guest.length +
      changedObjects.node.length +
      changedObjects.decorativeItems.length;

    if (total === 0) {
      return;
    }

    if (changedObjects.node.length > 0) {
      updateSeatPlanNodes(changedObjects.node);
    }

    if (changedObjects.guest.length > 0) {
      updateAllGuests(changedObjects.guest);
    }

    if (changedObjects.decorativeItems.length > 0) {
      updateDecorativeNodes(changedObjects.decorativeItems);
    }
  }, [changedObjects, updateAllGuests, updateDecorativeNodes, updateSeatPlanNodes]);

  const handleDownloadPdf = useCallback(async () => {
    if (!stageRef.current || stageSize.width === 0 || stageSize.height === 0) {
      toast.error("Planner stage not ready.");
      return;
    }

    setIsPdfDownloading(true);
    setIsExporting(true);
    setSelectedNodeId(null);

    const previousViewport = viewportRef.current;
    const exportBounds = getContentBounds(nodesRef.current);
    const exportViewport = getViewportForBounds(exportBounds);
    setViewport(exportViewport);

    try {
      if ("fonts" in document) {
        await document.fonts.ready;
      }

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      stageRef.current.batchDraw();
      boundaryStageRef.current?.batchDraw();

      const exportPixelRatio = clamp(
        PDF_EXPORT_TARGET_MAX_PIXELS /
          Math.max(stageSize.width, stageSize.height, 1),
        PDF_EXPORT_MIN_PIXEL_RATIO,
        PDF_EXPORT_MAX_PIXEL_RATIO,
      );
      const mainStageUrl = stageRef.current.toDataURL({
        pixelRatio: exportPixelRatio,
      });
      const mainStageImage = await loadImageElement(mainStageUrl);
      const compositeCanvas = document.createElement("canvas");
      compositeCanvas.width = mainStageImage.width;
      compositeCanvas.height = mainStageImage.height;

      const context = compositeCanvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to create export canvas.");
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);

      if (boundaryStageRef.current) {
        const boundaryStageUrl = boundaryStageRef.current.toDataURL({
          pixelRatio: exportPixelRatio,
        });
        const boundaryStageImage = await loadImageElement(boundaryStageUrl);
        const boundaryPadding = exportViewport.zoom * 30;
        const boundaryOffsetX =
          (exportViewport.x - boundaryPadding) * exportPixelRatio;
        const boundaryOffsetY =
          (exportViewport.y - boundaryPadding) * exportPixelRatio;

        context.drawImage(
          boundaryStageImage,
          boundaryOffsetX,
          boundaryOffsetY,
        );
      }

      context.drawImage(mainStageImage, 0, 0);

      const dataUrl = compositeCanvas.toDataURL("image/png");
      const image = await loadImageElement(dataUrl);
      const isLandscape = image.width >= image.height;

      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: "a3",
        compress: true,
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const title = companyInfo?.data?.title || "Wedding Planner";
      const logoUrl = companyInfo?.data?.imageUrl || "";
      const logoBoxSize = logoUrl ? 38 : 0;
      const logoSize = logoUrl ? 28 : 0;
      const headerStartY = PDF_EXPORT_TOP_MARGIN_MM;
      const titleTopY = headerStartY + (logoBoxSize > 0 ? logoBoxSize + 10 : 8);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(15, 23, 42);
      const titleLines = pdf.splitTextToSize(
        title,
        pageWidth - PDF_EXPORT_MARGIN_MM * 2,
      );

      if (logoUrl) {
        try {
          const logo = await loadImageElement(logoUrl);
          const logoBoxX = (pageWidth - logoBoxSize) / 2;
          const logoX = logoBoxX + (logoBoxSize - logoSize) / 2;
          const logoY = headerStartY + (logoBoxSize - logoSize) / 2;

          pdf.setFillColor(248, 250, 252);
          pdf.setDrawColor(203, 213, 225);
          pdf.roundedRect(
            logoBoxX,
            headerStartY,
            logoBoxSize,
            logoBoxSize,
            6,
            6,
            "FD",
          );

          try {
            const logoDataUrl = convertImageToPngDataUrl(logo);
            pdf.addImage(
              logoDataUrl,
              "PNG",
              logoX,
              logoY,
              logoSize,
              logoSize,
            );
          } catch {
            pdf.addImage(
              logo,
              getPdfImageFormatFromSource(logo.currentSrc || logoUrl),
              logoX,
              logoY,
              logoSize,
              logoSize,
            );
          }
        } catch {
          // Ignore logo rendering failure.
        }
      }

      pdf.text(titleLines, pageWidth / 2, titleTopY, { align: "center" });

      const headerBottomY =
        titleTopY + titleLines.length * PDF_EXPORT_TITLE_LINE_HEIGHT_MM + 4;

      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.5);
      pdf.line(
        PDF_EXPORT_MARGIN_MM,
        headerBottomY,
        pageWidth - PDF_EXPORT_MARGIN_MM,
        headerBottomY,
      );

      const availableWidth = pageWidth - PDF_EXPORT_MARGIN_MM * 2;
      const availableHeight =
        pageHeight - headerBottomY - PDF_EXPORT_FOOTER_MM - 8;
      const imageScale = Math.min(
        availableWidth / image.width,
        availableHeight / image.height,
      );
      const imageWidthMm = image.width * imageScale;
      const imageHeightMm = image.height * imageScale;
      const imageX = (pageWidth - imageWidthMm) / 2;
      const imageY = headerBottomY + 6;

      pdf.addImage(
        image,
        "PNG",
        imageX,
        imageY,
        imageWidthMm,
        imageHeightMm,
      );

      const stageToPdfScaleX = imageWidthMm / stageSize.width;
      const stageToPdfScaleY = imageHeightMm / stageSize.height;
      const worldRectToPdfBadge = (
        worldX: number,
        worldY: number,
        worldWidth: number,
        worldHeight: number,
      ) => ({
        x:
          imageX +
          (worldX * exportViewport.zoom + exportViewport.x) * stageToPdfScaleX,
        y:
          imageY +
          (worldY * exportViewport.zoom + exportViewport.y) * stageToPdfScaleY,
        width: worldWidth * exportViewport.zoom * stageToPdfScaleX,
        height: worldHeight * exportViewport.zoom * stageToPdfScaleY,
      });

      nodesRef.current.forEach((node) => {
        if (node.type === "tableNode") {
          const tableLabelWidth = Math.max(76, node.data.width - 28);
          const tableLabelX = node.position.x + (node.data.width - tableLabelWidth) / 2;
          const tableLabelBadge = worldRectToPdfBadge(
            tableLabelX,
            node.position.y + node.data.height / 2 - 31,
            tableLabelWidth,
            28,
          );

          drawPdfTextBadge(pdf, {
            text: node.data.label,
            ...tableLabelBadge,
            fontStyle: "bold",
            maxLines: 2,
            fillColor: [255, 255, 255],
            strokeColor: [226, 232, 240],
            textColor: [15, 23, 42],
          });

          const seatGeometries = getSeatGeometries(node);

          seatGeometries.forEach((seatGeometry, index) => {
            if (!seatGeometry.seat.occupiedByName?.trim()) {
              return;
            }

            const guestNameBadge = worldRectToPdfBadge(
              seatGeometry.x - 40,
              seatGeometry.y + (index % 2 === 0 ? 34 : -36),
              110,
              30,
            );

            drawPdfTextBadge(pdf, {
              text: seatGeometry.seat.occupiedByName,
              ...guestNameBadge,
              fontStyle: "bold",
              maxLines: 2,
              fillColor: [255, 255, 255],
              strokeColor: [203, 213, 225],
              textColor: [15, 23, 42],
            });
          });

          return;
        }

        if (node.type !== "chairNode") {
          return;
        }

        const chairSeats = getSeatGeometries(node);

        chairSeats.forEach((chairGeometry) => {
          if (!chairGeometry.seat.occupiedByName?.trim()) {
            return;
          }

          const guestNameBadge = worldRectToPdfBadge(
            chairGeometry.x - 36,
            chairGeometry.y + chairGeometry.height + 4,
            chairGeometry.width + 72,
            30,
          );

          drawPdfTextBadge(pdf, {
            text: chairGeometry.seat.occupiedByName,
            ...guestNameBadge,
            fontStyle: "bold",
            maxLines: 2,
            fillColor: [255, 255, 255],
            strokeColor: [203, 213, 225],
            textColor: [15, 23, 42],
          });
        });
      });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}`,
        pageWidth - PDF_EXPORT_MARGIN_MM,
        pageHeight - 10,
        { align: "right" },
      );

      pdf.save(
        `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-layout.pdf`,
      );
      toast.success("Layout downloaded.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF.");
    } finally {
      setViewport(previousViewport);
      setIsExporting(false);
      setIsPdfDownloading(false);
    }
  }, [
    companyInfo?.data?.imageUrl,
    companyInfo?.data?.title,
    getContentBounds,
    getViewportForBounds,
    stageSize.height,
    stageSize.width,
  ]);

  const pendingChangesCount =
    changedObjects.guest.length +
    changedObjects.node.length +
    changedObjects.decorativeItems.length;
  const unassignedGuestCount = guests.filter((guest) => !guest.isAssigned).length;
  const canInteractWithNodes = !guestDragState && !lineResizeState;
  const handleSelectNode = (nodeId: string) => setSelectedNodeId(nodeId);
  const handleSeatHover = (seatKey: string) => setHoveredSeatKey(seatKey);
  const handleSeatLeave = () => setHoveredSeatKey(null);
  const handleZoomIn = () =>
    setViewport((previous) => ({
      ...previous,
      zoom: clamp(previous.zoom * ZOOM_STEP, MIN_ZOOM, MAX_ZOOM),
    }));
  const handleZoomOut = () =>
    setViewport((previous) => ({
      ...previous,
      zoom: clamp(previous.zoom / ZOOM_STEP, MIN_ZOOM, MAX_ZOOM),
    }));

  useIdleTimer({
    timeout: 1000 * 5,
    onIdle: handleSaveChanges,
    debounce: 800,
  });

  return (
    <div className="relative flex h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef6f2_100%)]">
      <Sidebar
        onAddTableClick={handleAddTableClick}
        guests={guests}
        onRemoveGuest={handleRemoveGuest}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
      />

      <div
        ref={plannerViewportRef}
        className="relative h-full flex-1 overflow-hidden"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff,#f8fafc_55%,#eef2f7)]">
          <ZoomResponsiveBoundary
            venueWidth={venueWidth}
            venueHeight={venueHeight}
            SCALE_FACTOR={SCALE_FACTOR}
            venu_id={eventId}
            viewport={viewport}
            exportStageRef={boundaryStageRef}
          />

          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            className="absolute inset-0"
            onMouseDown={handleStageMouseDown}
            onWheel={handleWheel}
          >
            <Layer>
              <Group
                x={viewport.x}
                y={viewport.y}
                scaleX={viewport.zoom}
                scaleY={viewport.zoom}
              >
                <Rect
                  name="planner-background"
                  x={-LARGE_CANVAS_SIZE / 2}
                  y={-LARGE_CANVAS_SIZE / 2}
                  width={LARGE_CANVAS_SIZE}
                  height={LARGE_CANVAS_SIZE}
                  fill="#ffffff"
                />

                {gridLines.map((line, index) => (
                  <Line
                    key={`${line.points.join("-")}-${index}`}
                    points={line.points}
                    stroke="#edf2f7"
                    strokeWidth={1}
                    listening={false}
                  />
                ))}

                <Rect
                  x={0}
                  y={0}
                  width={venueWidthPx}
                  height={venueHeightPx}
                  fill="rgba(248,250,252,0.35)"
                  listening={false}
                />

                {nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;

                  if (isTableNode(node)) {
                    return (
                      <TableCanvasNode
                        key={node.id}
                        node={node}
                        isSelected={isSelected}
                        isExporting={isExporting}
                        hoveredSeatKey={
                          hoveredSeatKey?.startsWith(`${node.id}:`)
                            ? hoveredSeatKey
                            : null
                        }
                        canInteract={canInteractWithNodes}
                        onSelect={handleSelectNode}
                        onDragMove={handleNodeDragMove}
                        onDragEnd={handleNodeDragEnd}
                        onSeatHover={handleSeatHover}
                        onSeatLeave={handleSeatLeave}
                        onGuestHandleDown={handleGuestHandleDown}
                        onRemoveGuest={handleRemoveGuestFromSeat}
                      />
                    );
                  }

                  if (isChairNode(node)) {
                    return (
                      <ChairCanvasNode
                        key={node.id}
                        node={node}
                        isSelected={isSelected}
                        isExporting={isExporting}
                        hoveredSeatKey={
                          hoveredSeatKey?.startsWith(`${node.id}:`)
                            ? hoveredSeatKey
                            : null
                        }
                        canInteract={canInteractWithNodes}
                        onSelect={handleSelectNode}
                        onDragMove={handleNodeDragMove}
                        onDragEnd={handleNodeDragEnd}
                        onSeatHover={handleSeatHover}
                        onSeatLeave={handleSeatLeave}
                        onGuestHandleDown={handleGuestHandleDown}
                        onRemoveGuest={handleRemoveGuestFromSeat}
                      />
                    );
                  }

                  return (
                    <DecorativeCanvasNode
                      key={node.id}
                      node={node}
                      isSelected={isSelected}
                      isExporting={isExporting}
                      canInteract={canInteractWithNodes}
                      onSelect={handleSelectNode}
                      onDragMove={handleNodeDragMove}
                      onDragEnd={handleNodeDragEnd}
                      onLineResizeStart={handleLineResizeStart}
                    />
                  );
                })}
              </Group>
            </Layer>
          </Stage>
        </div>

        {!isExporting && !isInitialPlannerLoading && nodes.length === 0 ? (
          <PlannerEmptyState />
        ) : null}

        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-4 z-20 rounded-2xl border-white/70 bg-white/90 shadow-lg backdrop-blur hover:bg-white"
          onClick={() => setShowSidebar((previous) => !previous)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        {!isExporting && selectedNode && selectedNodeActionStyle && (
          <PlannerSelectionActions
            label={selectedNode.data.label}
            style={selectedNodeActionStyle}
            canEdit={
              selectedNode.type !== "decorativeNode" ||
              (selectedNode.data.category !== "line-horizontal" &&
                selectedNode.data.category !== "line-vertical")
            }
            onEdit={() => openEditDialog(selectedNode)}
            onDelete={() =>
              selectedNode.type === "decorativeNode"
                ? handleDeleteDecorative(selectedNode.id)
                : handleDeleteSeatPlanNode(selectedNode.id)
            }
          />
        )}

        {!isExporting && guestDragState && (
          <div
            className="pointer-events-none absolute z-40 rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white shadow-lg"
            style={{
              left: guestDragState.clientX,
              top: guestDragState.clientY,
              transform: "translate(12px, 12px)",
            }}
          >
            {guestDragState.guestName}
          </div>
        )}

        <PlannerActionBar
          pendingChanges={pendingChangesCount}
          guestCount={guests.length}
          unassignedGuestCount={unassignedGuestCount}
          isPdfDownloading={isPdfDownloading}
          onSave={handleSaveChanges}
          onDownloadPdf={handleDownloadPdf}
        />

        {isPdfDownloading ? <PlannerExportOverlay /> : null}

        {!isExporting && (
          <>
            <PlannerViewportControls
              zoom={viewport.zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onFit={fitToContent}
            />

            <PlannerMiniMap
              nodes={nodes}
              viewport={viewport}
              stageSize={stageSize}
              venueWidthPx={venueWidthPx}
              venueHeightPx={venueHeightPx}
              className="absolute bottom-4 right-4 z-20 hidden rounded-3xl border border-white/70 bg-white/92 p-2 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.4)] backdrop-blur md:block"
            />
          </>
        )}
      </div>

      <PlannerAddItemDialog
        open={isAddTableDialogOpen}
        onOpenChange={setIsAddTableDialogOpen}
        newTableType={newTableType}
        venueWidth={venueWidth}
        venueHeight={venueHeight}
        estimatedCapacity={estimatedCapacity}
        newTableLabel={newTableLabel}
        onLabelChange={setNewTableLabel}
        newTableNumSeats={newTableNumSeats}
        onNumSeatsChange={setNewTableNumSeats}
        measurementType={measurementType}
        onMeasurementTypeChange={setMeasurementType}
        tableWidthInput={tableWidthInput}
        onTableWidthChange={setTableWidthInput}
        tableHeightInput={tableHeightInput}
        onTableHeightChange={setTableHeightInput}
        onConfirm={handleConfirmAddTable}
      />

      <PlannerEditDialog
        open={Boolean(editDialogState)}
        editDialogState={editDialogState}
        hideCountField={
          editDialogState?.kind === "decorativeNode" ||
          Boolean(
            selectedNode &&
              selectedNode.type === "tableNode" &&
              selectedNode.data.type === "circular-single-seat",
          )
        }
        onOpenChange={(open) => {
          if (!open) {
            setEditDialogState(null);
          }
        }}
        onLabelChange={(value) =>
          setEditDialogState((previous) =>
            previous
              ? {
                  ...previous,
                  label: value,
                }
              : previous,
          )
        }
        onCountChange={(value) =>
          setEditDialogState((previous) =>
            previous
              ? {
                  ...previous,
                  seatsOrChairs: value,
                }
              : previous,
          )
        }
        onConfirm={handleEditConfirm}
      />

      {isInitialPlannerLoading ? <PlannerLoadingSkeleton /> : null}
    </div>
  );
}

export function WeddingPlannerWrapper() {
  return <WeddingPlanner />;
}

export default WeddingPlannerWrapper;
