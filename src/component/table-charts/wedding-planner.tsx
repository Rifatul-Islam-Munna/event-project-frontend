"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import { Group, Layer, Line, Rect, Stage } from "react-konva";
import { useIdleTimer } from "react-idle-timer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
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
import {
  FOCUS_ZOOM,
  GRID_GAP,
  LARGE_CANVAS_SIZE,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
} from "./planner-types";
import {
  clamp,
  getNodeRotation,
  getNodeWorldBounds,
  getSeatGeometries,
  getTransformedSeatCenter,
  hydrateDecorativeNode,
  hydrateSeatPlanNode,
  isChairNode,
  isTableNode,
  loadImageElement,
  serializeDecorativeNode,
  serializeSeatPlanNode,
  transformPointToNodeSpace,
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
const GUEST_LIST_SORTER = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

type ExportType = "layout-pdf" | "guest-list-pdf" | "guest-list-csv";

interface GuestListExportRow {
  groupLabel: string;
  seatLabel: string;
  guestName: string;
  email: string;
  phone: string;
  guestType: string;
  adults: string;
  children: string;
  status: "Assigned" | "Unassigned";
}

interface GuestListExportGroup {
  label: string;
  rows: GuestListExportRow[];
  status: "assigned" | "unassigned";
}

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

const getExportBaseName = (title: string) =>
  title.replace(/[^a-z0-9]/gi, "_").replace(/^_+|_+$/g, "").toLowerCase() ||
  "wedding_planner";

const escapeCsvValue = (value: string) =>
  `"${value.replace(/"/g, '""')}"`;

const downloadFileBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const normalizeExportValue = (value: string | number | null | undefined) =>
  value === null || value === undefined ? "" : String(value).trim();

const buildGuestListGroups = (
  nodes: PlannerNode[],
  guests: Guest[],
): GuestListExportGroup[] => {
  const guestById = new Map<string, Guest>();
  const guestByName = new Map<string, Guest>();
  const assignedGuestIds = new Set<string>();

  guests.forEach((guest) => {
    const guestKey = guest._id ?? guest.id;
    const guestName = guest.name.trim().toLowerCase();

    if (guestKey) {
      guestById.set(guestKey, guest);
    }

    if (guestName) {
      guestByName.set(guestName, guest);
    }
  });

  const seatingNodes = nodes
    .filter(
      (node): node is SeatingPlannerNode =>
        node.type === "tableNode" || node.type === "chairNode",
    )
    .sort((left, right) => {
      const labelCompare = GUEST_LIST_SORTER.compare(
        left.data.label,
        right.data.label,
      );

      if (labelCompare !== 0) {
        return labelCompare;
      }

      if (left.position.y !== right.position.y) {
        return left.position.y - right.position.y;
      }

      return left.position.x - right.position.x;
    });

  const assignedGroups = seatingNodes.flatMap((node) => {
    const seats = isChairNode(node) ? node.data.chairs : node.data.seats;
    const seatPrefix = isChairNode(node) ? "Chair" : "Seat";
    const label = node.data.label.trim() || `Area ${node.id.slice(-4)}`;
    const rows = seats.flatMap((seat, index) => {
      const guestName = seat.occupiedByName?.trim();

      if (!guestName) {
        return [];
      }

      if (seat.occupiedBy) {
        assignedGuestIds.add(seat.occupiedBy);
      }

      const guest =
        (seat.occupiedBy ? guestById.get(seat.occupiedBy) : undefined) ??
        guestByName.get(guestName.toLowerCase());

      return [
        {
          groupLabel: label,
          seatLabel: `${seatPrefix} ${index + 1}`,
          guestName,
          email: normalizeExportValue(guest?.email),
          phone: normalizeExportValue(guest?.phone),
          guestType: normalizeExportValue(guest?.type),
          adults: normalizeExportValue(guest?.adults),
          children: normalizeExportValue(guest?.children),
          status: "Assigned" as const,
        },
      ];
    });

    if (rows.length === 0) {
      return [];
    }

    return [
      {
        label,
        rows,
        status: "assigned" as const,
      },
    ];
  });

  const unassignedRows = guests
    .filter((guest) => {
      const guestKey = guest._id ?? guest.id;

      if (guestKey) {
        return !assignedGuestIds.has(guestKey);
      }

      return !guest.isAssigned;
    })
    .sort((left, right) => GUEST_LIST_SORTER.compare(left.name, right.name))
    .map((guest) => ({
      groupLabel: "Unassigned Guests",
      seatLabel: "",
      guestName: guest.name.trim(),
      email: normalizeExportValue(guest.email),
      phone: normalizeExportValue(guest.phone),
      guestType: normalizeExportValue(guest.type),
      adults: normalizeExportValue(guest.adults),
      children: normalizeExportValue(guest.children),
      status: "Unassigned" as const,
    }));

  return unassignedRows.length > 0
    ? [
        ...assignedGroups,
        {
          label: "Unassigned Guests",
          rows: unassignedRows,
          status: "unassigned" as const,
        },
      ]
    : assignedGroups;
};

function WeddingPlanner() {
  const query = useSearchParams();
  const params = useParams<{ id: string }>();
  const eventId = params.id;
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
  const [selectedSeatKey, setSelectedSeatKey] = useState<string | null>(null);
  const [seatTooltip, setSeatTooltip] = useState<{
    label: string;
    left: number;
    top: number;
    visible: boolean;
  } | null>(null);
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
  const [activeExportType, setActiveExportType] = useState<ExportType | null>(null);
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

  const plannerTitle = companyInfo?.data?.title?.trim() || "Wedding Planner";
  const plannerLogoUrl = companyInfo?.data?.imageUrl || "";
  const guestListGroups = useMemo(
    () => buildGuestListGroups(nodes, guests),
    [guests, nodes],
  );
  const guestListRowCount = useMemo(
    () =>
      guestListGroups.reduce(
        (total, group) => total + group.rows.length,
        0,
      ),
    [guestListGroups],
  );

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
        (bounds, node) => {
          const nodeBounds = getNodeWorldBounds(node);

          return {
            minX: Math.min(bounds.minX, nodeBounds.left - 60),
            minY: Math.min(bounds.minY, nodeBounds.top - 60),
            maxX: Math.max(bounds.maxX, nodeBounds.right + 60),
            maxY: Math.max(bounds.maxY, nodeBounds.bottom + 60),
          };
        },
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

  const hoveredSeatOverlay = useMemo(() => {
    if (!hoveredSeatKey) {
      return null;
    }

    const [nodeId, seatId] = hoveredSeatKey.split(":");
    const node = nodes.find(
      (item): item is SeatingPlannerNode =>
        item.id === nodeId && item.type !== "decorativeNode",
    );

    if (!node || !seatId) {
      return null;
    }

    const seatGeometry = getSeatGeometries(node).find(
      (geometry) => geometry.seat.id === seatId,
    );

    if (!seatGeometry?.seat.occupiedByName) {
      return null;
    }

    const seatCenter = getTransformedSeatCenter(node, seatGeometry);
    const screenPoint = worldToScreen(seatCenter);

    return {
      label: seatGeometry.seat.occupiedByName,
      left: screenPoint.x,
      top:
        screenPoint.y -
        (Math.max(seatGeometry.width, seatGeometry.height) * viewport.zoom) / 2 -
        16,
    };
  }, [hoveredSeatKey, nodes, viewport.zoom, worldToScreen]);

  const selectedNodeActionStyle = useMemo(() => {
    if (!selectedNode) {
      return null;
    }

    const bounds = getNodeWorldBounds(selectedNode);
    const screenLeft = worldToScreen({ x: bounds.left, y: bounds.centerY }).x;
    const screenCenterY = worldToScreen({
      x: bounds.centerX,
      y: bounds.centerY,
    }).y;

    return {
      left: Math.max(12, Math.min(stageSize.width - 56, screenLeft - 52)),
      top: Math.max(56, Math.min(stageSize.height - 56, screenCenterY)),
      transform: "translateY(-50%)",
    } as const;
  }, [selectedNode, stageSize.height, stageSize.width, worldToScreen]);

  useEffect(() => {
    if (hoveredSeatOverlay) {
      setSeatTooltip({
        ...hoveredSeatOverlay,
        visible: true,
      });
      return;
    }

    setSeatTooltip((previous) =>
      previous
        ? {
            ...previous,
            visible: false,
          }
        : null,
    );
  }, [hoveredSeatOverlay]);

  const findSeatTarget = useCallback((point: Point): SeatHitTarget | null => {
    const seatingNodes = nodesRef.current.filter(
      (node): node is SeatingPlannerNode => node.type !== "decorativeNode",
    );

    for (let nodeIndex = seatingNodes.length - 1; nodeIndex >= 0; nodeIndex -= 1) {
      const node = seatingNodes[nodeIndex];
      const pointInNodeSpace = transformPointToNodeSpace(point, node);
      const seatGeometries = getSeatGeometries(node);

      for (let seatIndex = seatGeometries.length - 1; seatIndex >= 0; seatIndex -= 1) {
        const seatGeometry = seatGeometries[seatIndex];

        if (
          pointInNodeSpace.x >= seatGeometry.x &&
          pointInNodeSpace.x <= seatGeometry.x + seatGeometry.width &&
          pointInNodeSpace.y >= seatGeometry.y &&
          pointInNodeSpace.y <= seatGeometry.y + seatGeometry.height
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

  useEffect(() => {
    if (!selectedSeatKey) {
      return;
    }

    const [nodeId, seatId] = selectedSeatKey.split(":");
    const node = nodes.find(
      (item): item is SeatingPlannerNode =>
        item.id === nodeId && item.type !== "decorativeNode",
    );
    const seatExists = node
      ? getSeatGeometries(node).some((seatGeometry) => seatGeometry.seat.id === seatId)
      : false;

    if (!seatExists) {
      setSelectedSeatKey(null);
    }
  }, [nodes, selectedSeatKey]);

  const handleRotateSelectedNode = useCallback(() => {
    if (!selectedNode || selectedNode.type === "decorativeNode") {
      return;
    }

    const nextRotation = (getNodeRotation(selectedNode) + 15) % 360;
    const updatedNode = {
      ...selectedNode,
      rotation: nextRotation,
    };

    setNodes((previous) =>
      previous.map((node) =>
        node.id === selectedNode.id ? updatedNode : node,
      ),
    );
    setSelectedSeatKey(null);
    trackSeatPlanChange(updatedNode);
  }, [selectedNode, setNodes, trackSeatPlanChange]);

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
      setSelectedSeatKey(null);
      setHoveredSeatKey(null);
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

  const handleDownloadLayoutPdf = useCallback(async () => {
    if (
      activeExportType ||
      !stageRef.current ||
      stageSize.width === 0 ||
      stageSize.height === 0
    ) {
      if (!stageRef.current || stageSize.width === 0 || stageSize.height === 0) {
        toast.error("Planner stage not ready.");
      }

      return;
    }

    setActiveExportType("layout-pdf");
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

      const title = plannerTitle;
      const logoUrl = plannerLogoUrl;
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
          if (getNodeRotation(node) !== 0) {
            return;
          }

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

        if (getNodeRotation(node) !== 0) {
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

      pdf.save(`${getExportBaseName(title)}-layout.pdf`);
      toast.success("Layout downloaded.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF.");
    } finally {
      setViewport(previousViewport);
      setIsExporting(false);
      setActiveExportType(null);
    }
  }, [
    activeExportType,
    getContentBounds,
    getViewportForBounds,
    plannerLogoUrl,
    plannerTitle,
    stageSize.height,
    stageSize.width,
  ]);

  const handleDownloadGuestListCsv = useCallback(() => {
    if (activeExportType) {
      return;
    }

    if (guestListRowCount === 0) {
      toast.error("No guests to export.");
      return;
    }

    setActiveExportType("guest-list-csv");

    try {
      const csvRows = [
        [
          "Area",
          "Seat",
          "Guest Name",
          "Email",
          "Phone",
          "Guest Type",
          "Adults",
          "Children",
          "Status",
        ],
        ...guestListGroups.flatMap((group) =>
          group.rows.map((row) => [
            row.groupLabel,
            row.seatLabel,
            row.guestName,
            row.email,
            row.phone,
            row.guestType,
            row.adults,
            row.children,
            row.status,
          ]),
        ),
      ];
      const csvContent = csvRows
        .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
        .join("\r\n");

      downloadFileBlob(
        new Blob([csvContent], { type: "text/csv;charset=utf-8;" }),
        `${getExportBaseName(plannerTitle)}-guest-list.csv`,
      );
      toast.success("Guest list CSV downloaded.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download guest list CSV.");
    } finally {
      setActiveExportType(null);
    }
  }, [activeExportType, guestListGroups, guestListRowCount, plannerTitle]);

  const handleDownloadGuestListPdf = useCallback(async () => {
    if (activeExportType) {
      return;
    }

    if (guestListRowCount === 0) {
      toast.error("No guests to export.");
      return;
    }

    setActiveExportType("guest-list-pdf");

    try {
      if ("fonts" in document) {
        await document.fonts.ready;
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 16;
      const contentWidth = pageWidth - marginX * 2;
      const footerY = pageHeight - 8;
      const assignedGroups = guestListGroups.filter(
        (group) => group.status === "assigned",
      );
      const assignedGuestCount = assignedGroups.reduce(
        (total, group) => total + group.rows.length,
        0,
      );
      const unassignedGuestCount =
        guestListGroups.find((group) => group.status === "unassigned")?.rows.length ?? 0;
      const generatedOn = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const toLines = (value: string | string[]) =>
        Array.isArray(value) ? value : [value];

      let logo: HTMLImageElement | null = null;

      if (plannerLogoUrl) {
        try {
          logo = await loadImageElement(plannerLogoUrl);
        } catch {
          logo = null;
        }
      }

      const drawHeader = (showSummary: boolean) => {
        const dateRightX = logo ? pageWidth - marginX - 18 : pageWidth - marginX;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(20);
        pdf.setTextColor(15, 23, 42);
        pdf.text(plannerTitle, marginX, 17);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(71, 85, 105);
        pdf.text("Guest Seating List", marginX, 23);
        pdf.setFontSize(9);
        pdf.text(`Generated on ${generatedOn}`, dateRightX, 23, {
          align: "right",
        });

        if (logo) {
          const logoBoxSize = 14;
          const logoSize = 10;
          const logoBoxX = pageWidth - marginX - logoBoxSize;
          const logoBoxY = 10;
          const logoX = logoBoxX + (logoBoxSize - logoSize) / 2;
          const logoY = logoBoxY + (logoBoxSize - logoSize) / 2;

          pdf.setFillColor(248, 250, 252);
          pdf.setDrawColor(203, 213, 225);
          pdf.roundedRect(
            logoBoxX,
            logoBoxY,
            logoBoxSize,
            logoBoxSize,
            3,
            3,
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
              getPdfImageFormatFromSource(logo.currentSrc || plannerLogoUrl),
              logoX,
              logoY,
              logoSize,
              logoSize,
            );
          }
        }

        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.45);
        pdf.line(marginX, 28, pageWidth - marginX, 28);

        let nextY = 34;

        if (showSummary) {
          pdf.setFillColor(248, 250, 252);
          pdf.setDrawColor(226, 232, 240);
          pdf.roundedRect(marginX, nextY, contentWidth, 14, 4, 4, "FD");
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(15, 23, 42);
          pdf.text(`${guestListRowCount} guests`, marginX + 4, nextY + 5.8);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(71, 85, 105);
          pdf.text(
            `${assignedGuestCount} seated | ${unassignedGuestCount} unassigned | ${assignedGroups.length} sections`,
            marginX + 4,
            nextY + 10.8,
          );
          nextY += 19;
        }

        return nextY;
      };

      const addPage = () => {
        pdf.addPage();
        return drawHeader(false);
      };

      let cursorY = drawHeader(true);

      const drawGroupHeader = (
        group: GuestListExportGroup,
        isContinuation = false,
      ) => {
        if (group.status === "unassigned") {
          pdf.setFillColor(255, 251, 235);
          pdf.setDrawColor(253, 230, 138);
          pdf.setTextColor(146, 64, 14);
        } else {
          pdf.setFillColor(236, 253, 245);
          pdf.setDrawColor(167, 243, 208);
          pdf.setTextColor(6, 95, 70);
        }

        pdf.roundedRect(marginX, cursorY, contentWidth, 10, 3, 3, "FD");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(
          `${group.label}${isContinuation ? " (cont.)" : ""}`,
          marginX + 4,
          cursorY + 6.2,
        );
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(
          `${group.rows.length} guests`,
          pageWidth - marginX - 4,
          cursorY + 6.2,
          { align: "right" },
        );
        pdf.setTextColor(15, 23, 42);
        cursorY += 13;
      };

      for (const group of guestListGroups) {
        if (cursorY + 13 > footerY) {
          cursorY = addPage();
        }

        drawGroupHeader(group);

        for (const row of group.rows) {
          const badgeText = row.seatLabel || "Open";
          const metaParts = [
            row.email,
            row.phone,
            row.guestType,
            row.adults ? `Adults ${row.adults}` : "",
            row.children ? `Children ${row.children}` : "",
          ].filter(Boolean);
          const badgeWidth = Math.max(
            18,
            Math.min(28, pdf.getTextWidth(badgeText) + 8),
          );
          const textX = marginX + badgeWidth + 8;
          const textWidth = Math.max(40, contentWidth - badgeWidth - 12);
          const nameLines = toLines(
            pdf.splitTextToSize(row.guestName, textWidth),
          ).slice(0, 2);
          const metaLines =
            metaParts.length > 0
              ? toLines(pdf.splitTextToSize(metaParts.join(" | "), textWidth)).slice(
                  0,
                  3,
                )
              : [];
          const rowHeight =
            7 + nameLines.length * 4 + (metaLines.length > 0 ? metaLines.length * 3.4 + 1 : 0);

          if (cursorY + rowHeight + 2 > footerY) {
            cursorY = addPage();
            drawGroupHeader(group, true);
          }

          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(226, 232, 240);
          pdf.roundedRect(marginX, cursorY, contentWidth, rowHeight, 3, 3, "FD");

          if (row.status === "Assigned") {
            pdf.setFillColor(220, 252, 231);
            pdf.setDrawColor(167, 243, 208);
            pdf.setTextColor(6, 95, 70);
          } else {
            pdf.setFillColor(254, 243, 199);
            pdf.setDrawColor(252, 211, 77);
            pdf.setTextColor(146, 64, 14);
          }

          pdf.roundedRect(marginX + 3, cursorY + 3, badgeWidth, 6.5, 3, 3, "FD");
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8.5);
          pdf.text(badgeText, marginX + 3 + badgeWidth / 2, cursorY + 7.4, {
            align: "center",
          });

          pdf.setTextColor(15, 23, 42);
          pdf.setFontSize(11);
          pdf.text(nameLines, textX, cursorY + 7);

          if (metaLines.length > 0) {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8.5);
            pdf.setTextColor(100, 116, 139);
            pdf.text(
              metaLines,
              textX,
              cursorY + 8 + nameLines.length * 4,
            );
          }

          cursorY += rowHeight + 3;
        }

        cursorY += 1;
      }

      const totalPages = pdf.getNumberOfPages();

      for (let page = 1; page <= totalPages; page += 1) {
        pdf.setPage(page);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(
          `Page ${page} of ${totalPages}`,
          pageWidth - marginX,
          footerY,
          { align: "right" },
        );
      }

      pdf.save(`${getExportBaseName(plannerTitle)}-guest-list.pdf`);
      toast.success("Guest list PDF downloaded.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download guest list PDF.");
    } finally {
      setActiveExportType(null);
    }
  }, [
    activeExportType,
    guestListGroups,
    guestListRowCount,
    plannerLogoUrl,
    plannerTitle,
  ]);

  const pendingChangesCount =
    changedObjects.guest.length +
    changedObjects.node.length +
    changedObjects.decorativeItems.length;
  const unassignedGuestCount = guests.filter((guest) => !guest.isAssigned).length;
  const activeExportLabel =
    activeExportType === "layout-pdf"
      ? "Exporting layout"
      : activeExportType === "guest-list-pdf"
        ? "Exporting guest PDF"
        : activeExportType === "guest-list-csv"
          ? "Exporting CSV"
          : "Export";
  const exportOverlayCopy =
    activeExportType === "guest-list-pdf"
      ? {
          title: "Generating guest list PDF",
          description: "Grouping guests by table for a clean printable list.",
        }
      : activeExportType === "guest-list-csv"
        ? {
            title: "Preparing guest list CSV",
            description: "Building a spreadsheet-ready export with table names.",
          }
        : {
            title: "Generating layout PDF",
            description: "Sharpening layout, names, and venue details.",
          };
  const canInteractWithNodes = !guestDragState && !lineResizeState;
  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedSeatKey(null);
  }, []);
  const handleSeatHover = (seatKey: string) => setHoveredSeatKey(seatKey);
  const handleSeatLeave = () => setHoveredSeatKey(null);
  const handleSeatSelect = (seatKey: string) => setSelectedSeatKey(seatKey);
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
    <div className="relative flex h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-slate-50">
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
        <div className="absolute inset-0 overflow-hidden bg-[#f7f7f2]">
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
                  fill="#fbfbf7"
                />

                {gridLines.map((line, index) => (
                  <Line
                    key={`${line.points.join("-")}-${index}`}
                    points={line.points}
                    stroke="rgba(15,23,42,0.06)"
                    strokeWidth={1}
                    listening={false}
                  />
                ))}

                <Rect
                  x={0}
                  y={0}
                  width={venueWidthPx}
                  height={venueHeightPx}
                  fill="rgba(255,255,255,0.72)"
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
                        selectedSeatKey={
                          selectedSeatKey?.startsWith(`${node.id}:`)
                            ? selectedSeatKey
                            : null
                        }
                        canInteract={canInteractWithNodes}
                        onSelect={handleSelectNode}
                        onDragMove={handleNodeDragMove}
                        onDragEnd={handleNodeDragEnd}
                        onSeatHover={handleSeatHover}
                        onSeatLeave={handleSeatLeave}
                        onSeatSelect={handleSeatSelect}
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
                        selectedSeatKey={
                          selectedSeatKey?.startsWith(`${node.id}:`)
                            ? selectedSeatKey
                            : null
                        }
                        canInteract={canInteractWithNodes}
                        onSelect={handleSelectNode}
                        onDragMove={handleNodeDragMove}
                        onDragEnd={handleNodeDragEnd}
                        onSeatHover={handleSeatHover}
                        onSeatLeave={handleSeatLeave}
                        onSeatSelect={handleSeatSelect}
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
          className="absolute left-4 top-4 z-20 rounded-xl border-slate-900/10 bg-white/96 shadow-sm backdrop-blur hover:bg-white"
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
            canRotate={selectedNode.type !== "decorativeNode"}
            onEdit={() => openEditDialog(selectedNode)}
            onDelete={() =>
              selectedNode.type === "decorativeNode"
                ? handleDeleteDecorative(selectedNode.id)
                : handleDeleteSeatPlanNode(selectedNode.id)
            }
            onRotate={handleRotateSelectedNode}
          />
        )}

        {!isExporting && seatTooltip ? (
          <div
            className="pointer-events-none absolute z-30 rounded-md bg-slate-900 px-2.5 py-1.5 text-[12px] font-medium text-white shadow-sm transition-all duration-150 ease-out"
            style={{
              left: seatTooltip.left,
              top: seatTooltip.top,
              opacity: seatTooltip.visible ? 1 : 0,
              transform: seatTooltip.visible
                ? "translate(-50%, -100%) translateY(0)"
                : "translate(-50%, -100%) translateY(6px)",
            }}
          >
            <span className="block max-w-[180px] truncate">
              {seatTooltip.label}
            </span>
          </div>
        ) : null}

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
          isExporting={Boolean(activeExportType)}
          activeExportLabel={activeExportLabel}
          onSave={handleSaveChanges}
          onDownloadLayoutPdf={handleDownloadLayoutPdf}
          onDownloadGuestListPdf={handleDownloadGuestListPdf}
          onDownloadGuestListCsv={handleDownloadGuestListCsv}
        />

        {activeExportType ? (
          <PlannerExportOverlay
            title={exportOverlayCopy.title}
            description={exportOverlayCopy.description}
          />
        ) : null}

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
              className="absolute bottom-4 right-4 z-20 hidden rounded-2xl border border-slate-900/10 bg-white/96 p-2 shadow-sm backdrop-blur md:block"
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
