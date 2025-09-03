"use client";
import type React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Edge,
  type Connection,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
} from "reactflow";
import "reactflow/dist/style.css";
import { v4 as uuidv4 } from "uuid";
import { Sidebar } from "./sidebar";
import { TableNode } from "./custom-nodes/table-node";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Menu, FileText, Database, Loader2 } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { toSvg } from "html-to-image";
import { jsPDF } from "jspdf";
import type { Guest } from "@/@types/events-details";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteGuest,
  deleteSeatPlan,
  getAllGuest,
  getAllSeatPlan,
  getHeader,
  postSeatPlan,
  updateBulkGuest,
  updateSeatPlan,
} from "@/actions/fetch-action";
import { useIdleTimer } from "react-idle-timer";
import { useStore } from "@/zustan-fn/save-alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define types for custom node data and guest data
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
  measurementType: string;
  widthTable: number;
  heightTable: number;
  onGuestDrop: (event: React.DragEvent, nodeId: string, seatId: string) => void;
  onRemoveGuestFromSeat: (
    nodeId: string,
    seatId: string,
    guestId: string
  ) => void;
  onDeleteTable: (nodeId: string) => void;
  onEditTable: (nodeId: string, newLabel: string, newNumSeats: number) => void;
}

interface ChangedObjects {
  guest: Guest[];
  node: Array<{
    id: string;
    type: string;
    event_id: string;
    position: { x: number; y: number };
    data: {
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
    };
    style: {
      width: string;
      height: string;
    };
  }>;
}

interface extentNode {
  event_id: string;
}

const nodeTypes = {
  tableNode: TableNode,
};

const snapGrid: [number, number] = [15, 15];

// Helper function to determine seat distribution for rectangular/square tables
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

const calculateTableDimensions = (
  type: TableType,
  numSeats: number
): { width: number; height: number } => {
  const seatDiameter = 30;
  const seatSpacing = 15;
  const tablePadding = 60;

  if (type === "circular-single-seat") {
    return { width: 100, height: 100 };
  } else if (type === "circular") {
    const minCircumference = numSeats * (seatDiameter + seatSpacing);
    const minDiameter = Math.max(150, minCircumference / Math.PI);
    return { width: minDiameter, height: minDiameter };
  } else if (type === "rectangular-one-sided") {
    const requiredSeatWidth =
      numSeats * seatDiameter +
      (numSeats > 1 ? (numSeats - 1) * seatSpacing : 0);
    const calculatedWidth = Math.max(200, requiredSeatWidth + tablePadding);
    return { width: calculatedWidth, height: 100 };
  } else {
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

    let calculatedWidth = Math.max(100, minWidthForSeats + tablePadding);
    let calculatedHeight = Math.max(60, minHeightForSeats + tablePadding);

    if (type === "square") {
      const maxDim = Math.max(calculatedWidth, calculatedHeight);
      calculatedWidth = maxDim;
      calculatedHeight = maxDim;
    }

    return { width: calculatedWidth, height: calculatedHeight };
  }
};

// IMPROVED: Zoom-responsive venue boundary component with better scaling
const ZoomResponsiveBoundary = ({ venueWidth, venueHeight, SCALE_FACTOR }) => {
  const { x, y, zoom } = useViewport();

  // FIXED: Better scaling that shows more realistic venue size
  const scaledWidth = venueWidth * SCALE_FACTOR * zoom * 7; // Your multiplier
  const scaledHeight = venueHeight * SCALE_FACTOR * zoom * 7; // Your multiplier

  // Calculate position based on current viewport
  const boundaryX = x;
  const boundaryY = y;

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: `${boundaryX}px`,
        top: `${boundaryY}px`,
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        border: `${Math.max(2, 3 * zoom)}px dashed #94a3b8`,
        borderRadius: `${8 * zoom}px`,
        backgroundColor: "transparent",
        transform: "translate3d(0, 0, 0)",
      }}
    >
      {/* Venue Label - scales with zoom */}
      <div
        className="absolute bg-white/90 px-3 py-1 rounded-lg shadow-sm border"
        style={{
          top: `${-40 * zoom}px`,
          left: 0,
          transform: `scale(${Math.max(0.8, zoom)})`,
          transformOrigin: "left top",
        }}
      >
        <span className="text-sm font-semibold text-slate-700">
          Venue: {venueWidth}m × {venueHeight}m
        </span>
      </div>

      {/* Corner markers - scale with zoom */}
      <div
        className="absolute border-l-2 border-t-2 border-slate-400"
        style={{
          top: `${2 * zoom}px`,
          left: `${2 * zoom}px`,
          width: `${4 * zoom}px`,
          height: `${4 * zoom}px`,
        }}
      ></div>
      <div
        className="absolute border-r-2 border-t-2 border-slate-400"
        style={{
          top: `${2 * zoom}px`,
          right: `${2 * zoom}px`,
          width: `${4 * zoom}px`,
          height: `${4 * zoom}px`,
        }}
      ></div>
      <div
        className="absolute border-l-2 border-b-2 border-slate-400"
        style={{
          bottom: `${2 * zoom}px`,
          left: `${2 * zoom}px`,
          width: `${4 * zoom}px`,
          height: `${4 * zoom}px`,
        }}
      ></div>
      <div
        className="absolute border-r-2 border-b-2 border-slate-400"
        style={{
          bottom: `${2 * zoom}px`,
          right: `${2 * zoom}px`,
          width: `${4 * zoom}px`,
          height: `${4 * zoom}px`,
        }}
      ></div>
    </div>
  );
};

function WeddingPlanner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const Query = useSearchParams();

  // Venue dimensions from URL
  const venueWidth = parseFloat(Query.get("venueWidth") || "50"); // meters
  const venueHeight = parseFloat(Query.get("venueHeight") || "30"); // meters
  const SCALE_FACTOR = 5; // 1 meter = 5 pixels
  const venueWidthPx = venueWidth * SCALE_FACTOR * 5; // Applied your multiplier
  const venueHeightPx = venueHeight * SCALE_FACTOR * 5; // Applied your multiplier

  // Calculate realistic table capacity
  const estimatedCapacity = Math.floor((venueWidth * venueHeight) / 25); // ~25m² per table including circulation

  const [changedObjects, setChangedObjects] = useState<ChangedObjects>({
    guest: [],
    node: [],
  });
  const setDataLength = useStore((state) => state.setDataAll);
  const dataLength = useStore((state) => state.setDataLength);
  const pathName = usePathname();
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [newTableType, setNewTableType] = useState<TableType | null>(null);
  const [newTableNumSeats, setNewTableNumSeats] = useState(8);
  const [newTableLabel, setNewTableLabel] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [mType, setMtype] = useState("");
  const [tWidth, setTWidth] = useState(0);
  const [tHeight, setTHeight] = useState(0);
  const { screenToFlowPosition, setViewport, getNodes, fitView, getViewport } =
    useReactFlow();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Use refs to store stable callback references
  const callbacksRef = useRef({
    handleGuestDrop: null as any,
    handleRemoveGuestFromSeat: null as any,
    handleDeleteTable: null as any,
    handleEditTable: null as any,
  });

  // IMPROVED: Calculate initial centered viewport
  const getInitialViewport = useCallback(() => {
    const containerWidth =
      reactFlowWrapper.current?.offsetWidth || window.innerWidth - 300;
    const containerHeight =
      reactFlowWrapper.current?.offsetHeight || window.innerHeight;

    // Calculate optimal zoom to fit venue with padding
    const zoomX = (containerWidth * 0.6) / venueWidthPx;
    const zoomY = (containerHeight * 0.6) / venueHeightPx;
    const optimalZoom = Math.min(zoomX, zoomY, 1.0);

    // Center the venue in the viewport
    const centerX = (containerWidth - venueWidthPx * optimalZoom) / 2;
    const centerY = (containerHeight - venueHeightPx * optimalZoom) / 2;

    return {
      x: centerX,
      y: centerY,
      zoom: Math.max(0.1, optimalZoom),
    };
  }, [venueWidthPx, venueHeightPx]);

  // IMPROVED: More lenient viewport constraints
  const constrainViewport = useCallback(
    (viewport: any) => {
      const { x, y, zoom } = viewport;

      // Get container dimensions
      const containerWidth =
        reactFlowWrapper.current?.offsetWidth || window.innerWidth - 300;
      const containerHeight =
        reactFlowWrapper.current?.offsetHeight || window.innerHeight;

      // Calculate scaled venue dimensions
      const scaledVenueWidth = venueWidthPx * zoom;
      const scaledVenueHeight = venueHeightPx * zoom;

      // More generous padding for better UX
      const padding = 200;
      const maxPanX = Math.min(
        padding,
        containerWidth - scaledVenueWidth + padding
      );
      const maxPanY = Math.min(
        padding,
        containerHeight - scaledVenueHeight + padding
      );

      // Allow generous panning but prevent going too far
      const constrainedX = Math.max(maxPanX - padding, Math.min(padding, x));
      const constrainedY = Math.max(maxPanY - padding, Math.min(padding, y));

      return {
        x: constrainedX,
        y: constrainedY,
        zoom,
      };
    },
    [venueWidthPx, venueHeightPx]
  );

  // IMPROVED: Less aggressive viewport correction
  const onMoveEnd = useCallback(
    (event: any, viewport: any) => {
      const constrainedViewport = constrainViewport(viewport);

      // Only correct if user has panned very far outside bounds
      const threshold = 100;
      if (
        Math.abs(constrainedViewport.x - viewport.x) > threshold ||
        Math.abs(constrainedViewport.y - viewport.y) > threshold
      ) {
        setViewport(constrainedViewport, { duration: 500 });
      }
    },
    [constrainViewport, setViewport]
  );

  const { data: seatPlandata, isLoading } = useQuery({
    queryKey: ["seat-plan", pathName.split("/").pop()],
    queryFn: () => getAllSeatPlan(pathName.split("/").pop() as string),
  });

  const { mutate: SeatPlan } = useMutation({
    mutationKey: ["added-new-chair"],
    mutationFn: (payload: Record<string, unknown>) => postSeatPlan(payload),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data?.error.message);
      }
    },
  });

  const { mutate: DeteTable } = useMutation({
    mutationKey: ["delte-new-chair"],
    mutationFn: (id: string) => deleteSeatPlan(id),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data?.error.message);
      }
    },
  });

  const { mutate: updateSeatAll } = useMutation({
    mutationKey: ["update-seat-plan"],
    mutationFn: (id: Record<string, unknown>) => updateSeatPlan(id),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data?.error.message);
      }
      toast.success("Guest sit Plan updated successfully");
      setChangedObjects((prev) => ({ ...prev, node: [] }));
      dataLength(0);
    },
  });

  const { mutate: updateAllguest } = useMutation({
    mutationKey: ["update-guests"],
    mutationFn: (id: Guest[]) => updateBulkGuest(id),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data?.error.message);
      }

      toast.success("Guest updated successfully");

      setChangedObjects((prev) => ({ ...prev, guest: [] }));
      dataLength(0);
    },
  });

  const trackChange = useCallback(
    (
      id: string,
      type: "node" | "guest",
      action: "created" | "updated" | "deleted",
      data: any
    ) => {
      setChangedObjects((prev) => {
        if (type === "guest") {
          const filteredGuests = prev.guest.filter((guest) => guest._id !== id);
          setDataLength(filteredGuests.length);
          return {
            ...prev,
            guest: [...filteredGuests, data],
          };
        } else {
          const filteredNodes = prev.node.filter((node: any) => node.id !== id);
          setDataLength(filteredNodes.length);
          return {
            ...prev,
            node: [...filteredNodes, data],
          };
        }
      });
    },
    []
  );

  useEffect(() => {
    const totalLength =
      changedObjects.guest.length + changedObjects.node.length;
    setDataLength(totalLength);
  }, [changedObjects.guest.length, changedObjects.node.length]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const { data, isPending } = useQuery({
    queryKey: ["get-all-guest", pathName.split("/").pop()],
    queryFn: () => getAllGuest(pathName.split("/").pop() as string),
  });

  const handleAddTableClick = (type: TableType) => {
    setNewTableType(type);
    if (type === "circular-single-seat") {
      setNewTableNumSeats(1);
    } else if (type === "circular") {
      setNewTableNumSeats(10);
    } else {
      setNewTableNumSeats(8);
    }
    setNewTableLabel("");
    setTHeight(0);
    setTWidth(0);
    setIsAddTableDialogOpen(true);
  };

  // Create stable callback functions using useCallback
  // Create stable callback functions using useCallback
  const handleGuestDrop = useCallback(
    (event: React.DragEvent, nodeId: string, seatId: string) => {
      event.preventDefault();
      const guestId = event.dataTransfer.getData("guestId");
      const guestName = event.dataTransfer.getData("guestName");
      const fromTableId = event.dataTransfer.getData("fromTableId");
      const fromSeatId = event.dataTransfer.getData("fromSeatId");

      if (!guestId || !guestName) {
        toast.error("Invalid guest data");
        return;
      }

      if (fromTableId && fromSeatId && fromTableId !== nodeId) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === fromTableId) {
              const updatedSeats = node.data.seats.map((seat) => {
                if (seat.id === fromSeatId && seat.occupiedBy === guestId) {
                  return { ...seat, occupiedBy: null, occupiedByName: null };
                }
                return seat;
              });

              const updatedNode = {
                ...node,
                data: { ...node.data, seats: updatedSeats },
              };

              trackChange(fromTableId, "node", "updated", updatedNode);
              return updatedNode;
            }
            return node;
          })
        );
      }

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const targetSeat = node.data.seats.find(
              (seat) => seat.id === seatId
            );
            if (targetSeat?.occupiedBy && targetSeat.occupiedBy !== guestId) {
              toast.error("This seat is already occupied");
              return node;
            }

            // FIXED: Exclude the fromSeatId from the check
            const isGuestAlreadyAssigned = node.data.seats.some(
              (seat) =>
                seat.occupiedBy === guestId &&
                seat.id !== seatId &&
                seat.id !== fromSeatId // This is the key fix!
            );
            if (isGuestAlreadyAssigned) {
              toast.error("Guest is already assigned to another seat");
              return node;
            }

            const updatedSeats = node.data.seats.map((seat) => {
              // Clear the source seat if moving within same table
              if (seat.id === fromSeatId && fromTableId === nodeId) {
                return { ...seat, occupiedBy: null, occupiedByName: null };
              }
              // Assign to target seat
              if (seat.id === seatId) {
                return {
                  ...seat,
                  occupiedBy: guestId,
                  occupiedByName: guestName,
                };
              }
              return seat;
            });

            const updatedNode = {
              ...node,
              data: { ...node.data, seats: updatedSeats },
            };

            trackChange(nodeId, "node", "updated", updatedNode);
            return updatedNode;
          }
          return node;
        })
      );

      setGuests((prevGuests) =>
        prevGuests.map((guest) => {
          if (guest._id === guestId) {
            const updatedGuest = { ...guest, isAssigned: true };
            trackChange(guestId, "guest", "updated", updatedGuest);
            return updatedGuest;
          }
          return guest;
        })
      );

      if (fromTableId && fromTableId !== nodeId) {
        toast.success(`${guestName} moved to new table successfully!`);
      } else if (fromTableId && fromSeatId) {
        toast.success(`${guestName} moved to different seat successfully!`);
      } else {
        toast.success(`${guestName} assigned to seat successfully!`);
      }
    },
    [setNodes, setGuests, trackChange]
  );

  const handleRemoveGuestFromSeat = useCallback(
    (nodeId: string, seatId: string, guestId: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const updatedSeats = node.data.seats.map((seat) => {
              if (seat.id === seatId && seat.occupiedBy === guestId) {
                return { ...seat, occupiedBy: null, occupiedByName: null };
              }
              return seat;
            });

            const updatedNode = {
              ...node,
              data: { ...node.data, seats: updatedSeats },
            };

            trackChange(nodeId, "node", "updated", updatedNode);
            return updatedNode;
          }
          return node;
        })
      );

      setGuests((prevGuests) =>
        prevGuests.map((guest) => {
          if (guest._id === guestId) {
            const updatedGuest = { ...guest, isAssigned: false };
            trackChange(guestId, "guest", "updated", updatedGuest);
            return updatedGuest;
          }
          return guest;
        })
      );

      toast.info(`Guest removed from seat.`);
    },
    [setNodes, setGuests, trackChange]
  );

  const handleDeleteTable = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const nodeToDelete = nds.find((n) => n.id === nodeId);
        if (nodeToDelete) {
          nodeToDelete.data.seats.forEach((seat) => {
            if (seat.occupiedBy) {
              setGuests((prevGuests) =>
                prevGuests.map((guest) => {
                  if (guest._id === seat.occupiedBy) {
                    const updatedGuest = { ...guest, isAssigned: false };
                    trackChange(guest._id, "guest", "updated", updatedGuest);
                    return updatedGuest;
                  }
                  return guest;
                })
              );
            }
          });
        }
        return nds.filter((node) => node.id !== nodeId);
      });

      DeteTable(nodeId);
      toast.info(`Table has been removed.`);
    },
    [setNodes, DeteTable, trackChange]
  );

  const handleEditTable = useCallback(
    (nodeId: string, newLabel: string, newNumSeats: number) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const currentSeats = node.data.seats;
            let updatedSeats = [...currentSeats];
            let finalNumSeats = newNumSeats;

            if (node.data.type === "circular-single-seat") {
              finalNumSeats = 1;
              updatedSeats = [
                {
                  id: currentSeats[0]?.id || uuidv4(),
                  occupiedBy: currentSeats[0]?.occupiedBy || null,
                  occupiedByName: currentSeats[0]?.occupiedByName || null,
                },
              ];
            } else if (finalNumSeats > currentSeats.length) {
              for (let i = currentSeats.length; i < finalNumSeats; i++) {
                updatedSeats.push({
                  id: uuidv4(),
                  occupiedBy: null,
                  occupiedByName: null,
                });
              }
            } else if (finalNumSeats < currentSeats.length) {
              const removedSeats = updatedSeats.splice(finalNumSeats);
              removedSeats.forEach((seat) => {
                if (seat.occupiedBy) {
                  setGuests((prevGuests) =>
                    prevGuests.map((guest) => {
                      if (guest._id === seat.occupiedBy) {
                        const updatedGuest = { ...guest, isAssigned: false };
                        trackChange(
                          guest._id,
                          "guest",
                          "updated",
                          updatedGuest
                        );
                        return updatedGuest;
                      }
                      return guest;
                    })
                  );
                }
              });
            }

            const { width, height } = calculateTableDimensions(
              node.data.type,
              finalNumSeats
            );

            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                label: newLabel,
                numSeats: finalNumSeats,
                seats: updatedSeats,
                width,
                height,
              },
              style: { width: `${width}px`, height: `${height}px` },
            };

            trackChange(nodeId, "node", "updated", updatedNode);
            return updatedNode;
          }
          return node;
        })
      );
      toast.success(`Table "${newLabel}" has been updated.`);
    },
    [setNodes, setGuests, trackChange]
  );

  // Update callback refs
  callbacksRef.current = {
    handleGuestDrop,
    handleRemoveGuestFromSeat,
    handleDeleteTable,
    handleEditTable,
  };

  // Helper function to create node with callbacks
  const createNodeWithCallbacks = (nodeData: any) => ({
    ...nodeData,
    data: {
      ...nodeData.data,
      onGuestDrop: callbacksRef.current.handleGuestDrop,
      onRemoveGuestFromSeat: callbacksRef.current.handleRemoveGuestFromSeat,
      onDeleteTable: callbacksRef.current.handleDeleteTable,
      onEditTable: callbacksRef.current.handleEditTable,
    },
  });

  // Helper function to constrain table positions within venue bounds
  const constrainTablePosition = useCallback(
    (x: number, y: number, tableWidth: number, tableHeight: number) => {
      const margin = 20;
      const constrainedX = Math.max(
        margin,
        Math.min(x, venueWidthPx - tableWidth - margin)
      );
      const constrainedY = Math.max(
        margin,
        Math.min(y, venueHeightPx - tableHeight - margin)
      );
      return { x: constrainedX, y: constrainedY };
    },
    [venueWidthPx, venueHeightPx]
  );

  const handleConfirmAddTable = () => {
    if (!newTableType || !newTableLabel.trim()) {
      toast.error("Please provide a table name.");
      return;
    }

    const seats = Array.from({ length: newTableNumSeats }, (_, i) => ({
      id: uuidv4(),
      occupiedBy: null,
      occupiedByName: null,
    }));

    const { width, height } = calculateTableDimensions(
      newTableType,
      newTableNumSeats
    );

    const newNodeId = uuidv4();

    // Position new tables within venue bounds with better constraints
    const margin = 20;
    const maxX = Math.max(margin, venueWidthPx - width - margin);
    const maxY = Math.max(margin, venueHeightPx - height - margin);

    const randomX = Math.random() * (maxX - margin) + margin;
    const randomY = Math.random() * (maxY - margin) + margin;

    const constrainedPosition = constrainTablePosition(
      randomX,
      randomY,
      width,
      height
    );

    const newNodeData = {
      id: newNodeId,
      type: "tableNode",
      event_id: pathName.split("/").pop() as string,
      position: constrainedPosition,
      data: {
        event_id: pathName.split("/").pop() as string,
        label: newTableLabel,
        type: newTableType,
        seats,
        width,
        height,
        numSeats: newTableNumSeats,
        measurementType: mType,
        widthTable: tWidth,
        heightTable: tHeight,
      },
      style: { width: `${width}px`, height: `${height}px` },
    };

    const newNode = createNodeWithCallbacks(newNodeData);

    SeatPlan(newNode);
    setNodes((nds) => nds.concat(newNode));
    trackChange(newNodeId, "node", "created", newNode);

    setIsAddTableDialogOpen(false);
    toast.success(`Table "${newTableLabel}" added successfully!`);
  };

  const query = useQueryClient();
  const handleAddGuest = (guestName: string) => {
    console.log("guestName->", guestName);
  };

  const { mutate, isPending: IsDeletePending } = useMutation({
    mutationKey: ["deleteGuest"],
    mutationFn: (id: string) => deleteGuest(id),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data.error.message);
      }
      query.refetchQueries({ queryKey: ["get-all-guest"], exact: false });
      return toast.success("Guest deleted successfully");
    },
    onError: (error) => {
      return toast.error(error?.message);
    },
  });

  const handleRemoveGuest = useCallback(
    (guestId: string) => {
      const guestToRemove = guests.find((g) => g._id === guestId);
      if (guestToRemove) {
        trackChange(guestId, "guest", "deleted", guestToRemove);
      }

      setNodes((nds) =>
        nds.map((node) => {
          const updatedSeats = node.data.seats.map((seat) => {
            if (seat.occupiedBy === guestId) {
              return { ...seat, occupiedBy: null, occupiedByName: null };
            }
            return seat;
          });

          const hasChanges = node.data.seats.some(
            (seat) => seat.occupiedBy === guestId
          );
          if (hasChanges) {
            const updatedNode = {
              ...node,
              data: { ...node.data, seats: updatedSeats },
            };
            trackChange(node.id, "node", "updated", updatedNode);
          }

          return { ...node, data: { ...node.data, seats: updatedSeats } };
        })
      );
      mutate(guestId);
      setGuests((prevGuests) =>
        prevGuests.filter((guest) => guest._id !== guestId)
      );
    },
    [setNodes, setGuests, trackChange, guests, mutate]
  );

  const handleNodesChange = useCallback(
    (changes: any[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          const node = nodes.find((n) => n.id === change.id);
          if (node) {
            // Constrain table position within venue bounds
            const constrainedPosition = constrainTablePosition(
              change.position.x,
              change.position.y,
              node.data.width,
              node.data.height
            );

            const updatedNode = {
              ...node,
              position: constrainedPosition,
            };

            // Update the change object with constrained position
            change.position = constrainedPosition;

            trackChange(change.id, "node", "updated", updatedNode);
          }
        }
      });
      onNodesChange(changes);
    },
    [onNodesChange, nodes, trackChange, constrainTablePosition]
  );

  const handleSaveChanges = useCallback(() => {
    const totalChanges =
      changedObjects.guest.length + changedObjects.node.length;
    if (totalChanges === 0) {
      toast.info("No changes to save.");
      return;
    }
    if (changedObjects.node.length > 0) {
      updateSeatAll(changedObjects.node);
    }
    if (changedObjects.guest.length > 0) {
      updateAllguest(changedObjects.guest);
    }

    updateAllguest(changedObjects.guest);
  }, [changedObjects, updateSeatAll, updateAllguest]);

  useEffect(() => {
    if (data?.data) {
      setGuests(data.data);
    }
  }, [data]);

  // Load seat plan data and constrain existing tables within venue bounds
  useEffect(() => {
    if (seatPlandata?.data && seatPlandata.data.length > 0) {
      const nodesWithCallbacks = seatPlandata.data.map((nodeData: any) => {
        // Constrain existing tables within venue bounds
        const constrainedPosition = constrainTablePosition(
          nodeData.position.x,
          nodeData.position.y,
          nodeData.data.width || 100,
          nodeData.data.height || 100
        );

        const constrainedNode = {
          ...nodeData,
          position: constrainedPosition,
        };
        return createNodeWithCallbacks(constrainedNode);
      });
      setNodes(nodesWithCallbacks);
    } else {
      setNodes([]);
    }

    // Set initial centered viewport after a small delay
    setTimeout(() => {
      const initialViewport = getInitialViewport();
      setViewport(initialViewport, { duration: 800 });
    }, 200);
  }, [
    seatPlandata?.data,
    constrainTablePosition,
    getInitialViewport,
    setViewport,
  ]);

  const HEADER_H = 100;
  const MARGIN = 10;

  function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = src;
    });
  }
  const { data: ComInfo } = useQuery({
    queryKey: ["header"],
    queryFn: () => getHeader(),
    gcTime: 1000 * 60 * 60,
  });
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  const handleDownloadPdf = useCallback(() => {
    setIsPdfDownloading(true);
    const eventName = ComInfo?.data?.title || "Wedding Planner";
    const eventLogo = ComInfo?.data?.imageUrl || "";

    if (!reactFlowWrapper.current) {
      toast.error("React Flow container not found for PDF capture.");
      return;
    }

    const reactFlowPane = reactFlowWrapper.current.querySelector(
      ".react-flow__pane"
    ) as HTMLElement;
    const reactFlowControls = reactFlowWrapper.current.querySelector(
      ".react-flow__controls"
    ) as HTMLElement;
    const reactFlowMiniMap = reactFlowWrapper.current.querySelector(
      ".react-flow__minimap"
    ) as HTMLElement;

    if (!reactFlowPane) {
      toast.error("React Flow pane not found for PDF capture.");
      return;
    }

    const initialViewport = getViewport();
    if (reactFlowControls) reactFlowControls.style.display = "none";
    if (reactFlowMiniMap) reactFlowMiniMap.style.display = "none";

    fitView({ padding: 0.1, includeHiddenNodes: true });

    setTimeout(async () => {
      try {
        // Back to the 10x scaling that worked well
        const MAX_SCALE = 10;
        const originalRect = reactFlowPane.getBoundingClientRect();

        const dataUrl = await toSvg(reactFlowPane, {
          quality: 2.0,
          pixelRatio: 2.5,
          backgroundColor: "#ffffff",
          width: originalRect.width * MAX_SCALE,
          height: originalRect.height * MAX_SCALE,
          canvasWidth: originalRect.width * MAX_SCALE,
          canvasHeight: originalRect.height * MAX_SCALE,
          skipAutoScale: true,
          style: {
            transform: `scale(${MAX_SCALE})`,
            transformOrigin: "top left",
            width: originalRect.width + "px",
            height: originalRect.height + "px",
            imageRendering: "pixelated",
            WebkitImageRendering: "pixelated",
          },
        });

        const img = await loadImage(dataUrl);

        // Convert to high-quality JPEG to avoid memory issues with large PNG
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Very high quality JPEG
        const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.98);
        const finalImg = await loadImage(jpegDataUrl);

        // Calculate PDF dimensions
        const imgWidthMM = (finalImg.width / MAX_SCALE) * 0.264583;
        const imgHeightMM = (finalImg.height / MAX_SCALE) * 0.264583;

        const HEADER_HEIGHT = 35;
        const MARGIN = 20;
        const pageWidth = Math.max(imgWidthMM + MARGIN * 2, 210);
        const pageHeight = HEADER_HEIGHT + imgHeightMM + MARGIN * 2;

        const pdf = new jsPDF({
          orientation: imgWidthMM > imgHeightMM ? "landscape" : "portrait",
          unit: "mm",
          format: [pageWidth, pageHeight],
          compress: false, // No compression for better quality
          precision: 16, // High precision like before
        });

        const pdfPageWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();

        // Add logo
        let logoHeight = 0;
        if (eventLogo) {
          try {
            const logoImg = await loadImage(eventLogo);
            const logoSize = 25;
            const logoX = (pdfPageWidth - logoSize) / 2;
            const logoY = MARGIN;
            pdf.addImage(logoImg, "PNG", logoX, logoY, logoSize, logoSize);
            logoHeight = logoSize + 10;
          } catch {
            console.warn("Failed to load logo image");
          }
        }

        // Title
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(24);
        pdf.setTextColor(40, 40, 40);
        const titleY = logoHeight > 0 ? MARGIN + logoHeight : MARGIN + 20;
        pdf.text(eventName || "", pdfPageWidth / 2, titleY, {
          align: "center",
        });

        // Add high-quality image with no compression
        const diagramY = titleY + 20;
        const diagramX = (pdfPageWidth - imgWidthMM) / 2;

        pdf.addImage(
          finalImg,
          "JPEG",
          diagramX,
          diagramY,
          imgWidthMM,
          imgHeightMM,
          undefined,
          "NONE"
        ); // No compression

        // Footer
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(120, 120, 120);
        const currentDate = new Date().toLocaleDateString();
        const footerText = `Generated on ${currentDate} - High Quality (10x)`;
        pdf.text(footerText, pdfPageWidth - MARGIN, pdfPageHeight - 10, {
          align: "right",
        });

        pdf.save(
          `${eventName
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase()}-high-quality-layout.pdf`
        );
        toast.success("High-quality layout downloaded!");
        setIsPdfDownloading(false);
      } catch (error) {
        console.error("PDF generation error:", error);
        toast.error("Failed to download PDF.");
        setIsPdfDownloading(false);
      } finally {
        setViewport(initialViewport);
        if (reactFlowControls) reactFlowControls.style.display = "";
        if (reactFlowMiniMap) reactFlowMiniMap.style.display = "";
        setIsPdfDownloading(false);
      }
    }, 300);
  }, [fitView, getViewport, setViewport]);

  const handleOnIdle = () => {
    if (changedObjects.guest.length > 0) {
      updateAllguest(changedObjects.guest);
    }
    if (changedObjects.node.length > 0) {
      updateSeatAll(changedObjects.node);
    }
  };

  useIdleTimer({
    timeout: 1000 * 5,
    onIdle: handleOnIdle,
    debounce: 800,
  });

  return (
    <div className="flex h-screen w-full overflow-hidden main-planner-container">
      <Sidebar
        onAddTableClick={handleAddTableClick}
        guests={guests}
        onAddGuest={handleAddGuest}
        onRemoveGuest={handleRemoveGuest}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
      />
      <div className="flex-grow h-full relative" ref={reactFlowWrapper}>
        {/* Zoom-Responsive Venue Boundary */}
        <ZoomResponsiveBoundary
          venueWidth={venueWidth}
          venueHeight={venueHeight}
          SCALE_FACTOR={SCALE_FACTOR}
        />

        <Button
          variant="outline"
          size="icon"
          className="md:hidden absolute top-4 left-4 z-20 bg-transparent"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        {/* Enhanced Venue Info Panel */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-lg hidden p-4 shadow-lg border">
          <h3 className="text-sm font-semibold text-slate-700 mb-2 text-center">
            Venue Information
          </h3>
          <div className="flex gap-4 text-xs text-slate-600">
            <div>
              <strong>Size:</strong> {venueWidth}m × {venueHeight}m
            </div>
            <div>
              <strong>Area:</strong> {(venueWidth * venueHeight).toFixed(1)}m²
            </div>
            <div>
              <strong>Scale:</strong> 1m = {SCALE_FACTOR}px
            </div>
            <div className="text-blue-600">
              <strong>Capacity:</strong> ~{estimatedCapacity} tables
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20 flex gap-2 top-right-buttons">
          <Button
            onClick={handleSaveChanges}
            variant="secondary"
            disabled={
              changedObjects.guest.length + changedObjects.node.length === 0
            }
          >
            <Database className="w-4 h-4 mr-2" />
            Save Changes (
            {changedObjects.guest.length + changedObjects.node.length})
          </Button>
          <Button
            onClick={handleDownloadPdf}
            disabled={isPdfDownloading}
            variant="outline"
          >
            {isPdfDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}{" "}
            Download PDF
          </Button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={snapGrid}
          className="bg-transparent"
          onMoveEnd={onMoveEnd}
          minZoom={0.05}
          maxZoom={4}
          // REMOVED defaultViewport - using programmatic setViewport instead
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={15} size={1} />
        </ReactFlow>
      </div>

      <Dialog
        open={isAddTableDialogOpen}
        onOpenChange={setIsAddTableDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Add New{" "}
              {newTableType
                ? newTableType.charAt(0).toUpperCase() + newTableType.slice(1)
                : ""}{" "}
              Table
            </DialogTitle>
            <DialogDescription>
              Configure the details for your new table. Tables will be placed
              within the venue area ({venueWidth}m × {venueHeight}m).
              <br />
              Estimated capacity: ~{estimatedCapacity} tables total.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tableName" className="text-right">
                Table Name
              </Label>
              <Input
                id="tableName"
                value={newTableLabel}
                onChange={(e) => setNewTableLabel(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Wedding Table, Fancy Table"
              />
            </div>
            {newTableType !== "circular-single-seat" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numSeats" className="text-right">
                  Number of Seats
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Slider
                    id="numSeats"
                    min={2}
                    max={20}
                    step={1}
                    value={[newTableNumSeats]}
                    onValueChange={(val) => setNewTableNumSeats(val[0])}
                    className="w-[calc(100%-40px)]"
                  />
                  <span className="w-10 text-right">{newTableNumSeats}</span>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tableName" className="text-right">
              Measurement Type
            </Label>
            <Select value={mType} onValueChange={setMtype}>
              <SelectTrigger className="w-[190px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ft">ft</SelectItem>
                <SelectItem value="m">meter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tableName" className="text-right">
              Table width
            </Label>
            <Input
              id="tableName"
              value={tWidth > 0 ? tWidth : ""}
              onChange={(e) => setTWidth(Number(e.target.value))}
              className="col-span-3"
              placeholder="e.g., 2.5"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tableName" className="text-right">
              Table height
            </Label>
            <Input
              id="tableName"
              value={tHeight > 0 ? tHeight : ""}
              onChange={(e) => setTHeight(Number(e.target.value))}
              className="col-span-3"
              placeholder="e.g., 1.5"
            />
          </div>

          <DialogFooter>
            <Button onClick={handleConfirmAddTable}>Add Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function WeddingPlannerWrapper() {
  return (
    <ReactFlowProvider>
      <WeddingPlanner />
    </ReactFlowProvider>
  );
}
