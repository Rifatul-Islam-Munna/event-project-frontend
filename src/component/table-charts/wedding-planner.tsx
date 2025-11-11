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
import { useIdleTimer } from "react-idle-timer";
import { useStore } from "@/zustan-fn/save-alert";
import { ChairNode } from "./custom-nodes/chair-node";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ZoomResponsiveBoundary from "./ZoomResponsiveBoundary";
import {
  DecorativeNode,
  type DecorativeNodeData,
} from "./decorative-node/decorative-node";
import { DecorativeSidebar } from "./decorative-node/decorative-sidebar";
// Define types for custom node data and guest data
export type TableType =
  | "rectangular"
  | "square"
  | "circular"
  | "rectangular-one-sided"
  | "circular-single-seat"
  | "chair-row"
  | "chair-column"
  | "line-horizontal" // ✅ ADD THIS
  | "line-vertical"; // ✅ ADD THIS
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
  decorativeItems: Array<{
    // Add this new array
    id: string;
    type: string;
    event_id: string;
    position: { x: number; y: number };
    data: {
      label: string;
      imageUrl: string;
      width: number;
      height: number;
      category: string;
    };
  }>;
}

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
  decorativeNode: DecorativeNode,
  chairNode: ChairNode,
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
    decorativeItems: [],
  });

  console.log("changedObjects->", changedObjects.decorativeItems);
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
  console.log("guestes-out-sidegn->", guests);

  //added new

  const [newChairLayout, setNewChairLayout] = useState<
    "chair-row" | "chair-column" | null
  >(null);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const handleAddChairClick = (layout: "chair-row" | "chair-column") => {
    setNewTableType(layout);
    setNewChairLayout(layout);
    setNewTableNumSeats(5); // Default 5 chairs
    setNewTableLabel("");
    setIsAddTableDialogOpen(true);
  };

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
    const defaultZoom = Math.max(1.2, optimalZoom);
    // Center the venue in the viewport
    const centerX = (containerWidth - venueWidthPx * optimalZoom) / 2;
    const centerY = (containerHeight - venueHeightPx * optimalZoom) / 2;

    return {
      x: centerX,
      y: centerY,
      zoom: defaultZoom,
    };
  }, [venueWidthPx, venueHeightPx]);

  // IMPROVED: More lenient viewport constraints
  // NEW: Auto-zoom to new table when created
  const zoomToNewTable = useCallback(
    (tablePosition: { x: number; y: number }) => {
      const containerWidth =
        reactFlowWrapper.current?.offsetWidth || window.innerWidth - 300;
      const containerHeight =
        reactFlowWrapper.current?.offsetHeight || window.innerHeight;

      // Calculate position to center the new table with good zoom level
      const targetZoom = 1.8; // High zoom for detailed table work
      const targetX = containerWidth / 2 - tablePosition.x * targetZoom;
      const targetY = containerHeight / 2 - tablePosition.y * targetZoom;

      setViewport(
        {
          x: targetX,
          y: targetY,
          zoom: targetZoom,
        },
        { duration: 800 } // Smooth 800ms animation
      );
    },
    [setViewport]
  );

  const { data: seatPlandata, isLoading } = useQuery({
    queryKey: ["seat-plan", pathName.split("/").pop()],
    queryFn: () => getAllSeatPlan(pathName.split("/").pop() as string),
  });
  const { data: DecoratorData, isLoading: DecoratorLoading } = useQuery({
    queryKey: ["seat-plan-decorator", pathName.split("/").pop()],
    queryFn: () => getDecorator(pathName.split("/").pop() as string),
  });
  const { mutate: PostNewDecorator } = useMutation({
    mutationKey: ["added-new-chair-deco"],
    mutationFn: (payload: Record<string, unknown>) => postDecorator(payload),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data?.error.message);
      }
    },
  });
  const { mutate: UpdateDecorator } = useMutation({
    mutationKey: ["added-new-chair-deco"],
    mutationFn: (payload: Record<string, unknown>[]) =>
      updateDecorator(payload),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data?.error.message);
      }
      setChangedObjects((prev) => ({ ...prev, decorativeItems: [] }));
      dataLength(0);
    },
  });
  const { mutate: DeleteDeco } = useMutation({
    mutationKey: ["delte-new-chair-dec"],
    mutationFn: (id: string) => deleteDecorator(id),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data?.error.message);
      }
    },
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
        const newChangedObjects = { ...prev };

        if (type === "guest") {
          // Remove duplicate guest by ID, then add new one
          const filteredGuests = prev.guest.filter((guest) => guest._id !== id);
          newChangedObjects.guest = [...filteredGuests, data];
        } else {
          // Remove duplicate node by ID, then add new one
          const filteredNodes = prev.node.filter((node: any) => node.id !== id);
          let nodeDataForDB = data;

          if (data.type === "chairNode") {
            nodeDataForDB = {
              ...data,
              data: {
                ...data.data,
                seats: data.data.chairs || data.data.seats || [],
                numSeats: data.data.numChairs || data.data.numSeats || 0,
                chairs: undefined,
                numChairs: undefined,
              },
            };
          }

          newChangedObjects.node = [...filteredNodes, nodeDataForDB];
        }

        // ✅ Update store with CORRECT total count
        const totalLength =
          newChangedObjects.guest.length +
          newChangedObjects.node.length +
          newChangedObjects.decorativeItems.length;
        setDataLength(totalLength);

        return newChangedObjects;
      });
    },
    [setDataLength] // ✅ Add setDataLength as dependency
  );

  const trackDecorativeChange = useCallback(
    (id: string, action: "created" | "updated" | "deleted", data: any) => {
      setChangedObjects((prev) => {
        const filteredItems = prev.decorativeItems.filter(
          (item) => item.id !== id
        );

        const newDecoItems =
          action === "deleted" ? filteredItems : [...filteredItems, data];

        const newChangedObjects = {
          ...prev,
          decorativeItems: newDecoItems,
        };

        // ✅ Update store with CORRECT total count
        const totalLength =
          newChangedObjects.guest.length +
          newChangedObjects.node.length +
          newChangedObjects.decorativeItems.length;
        setDataLength(totalLength);

        return newChangedObjects;
      });
    },
    [setDataLength] // ✅ Add dependency
  );

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
  // At the top of your component, add this ref:
  const isProcessingDropRef = useRef(false);

  // Then replace your entire handleGuestDrop with this:
  const handleGuestDrop = useCallback(
    (event: React.DragEvent, nodeId: string, seatId: string) => {
      event.preventDefault();
      event.stopPropagation();

      const guestId = event.dataTransfer.getData("guestId");
      const guestName = event.dataTransfer.getData("guestName");
      const fromTableId = event.dataTransfer.getData("fromTableId");
      const fromSeatId = event.dataTransfer.getData("fromSeatId");

      if (!guestId || !guestName) {
        toast.error("Invalid guest data");
        return;
      }

      setGuests((currentGuests) => {
        const guest = currentGuests.find((g) => g._id === guestId);

        if (!guest) {
          toast.error("Guest not found");
          return currentGuests;
        }

        const totalSeatsNeeded = Math.max(
          1,
          (guest.adults ?? 0) + (guest.children ?? 0)
        );

        // Check if this guest is already seated at the target
        let alreadySeated = false;
        setNodes((nds) => {
          const targetNode = nds.find((n) => n.id === nodeId);
          if (targetNode) {
            const seatsArray =
              targetNode.type === "chairNode"
                ? targetNode.data.chairs
                : targetNode.data.seats;
            const existingSeats = seatsArray.filter(
              (seat) => seat.occupiedBy === guestId
            );
            if (existingSeats.length > 0) {
              alreadySeated = true;
              console.log("🚫 Guest already seated here!");
            }
          }
          return nds;
        });

        if (alreadySeated) {
          console.log("🚫 BLOCKED - Guest already assigned to this table");
          return currentGuests;
        }

        console.log("💺 TOTAL SEATS NEEDED:", totalSeatsNeeded);

        // ✅ Track if the guest was successfully seated
        let wasSuccessfullySeated = false;

        // Remove from source table/chair
        if (fromTableId && fromSeatId && fromTableId !== nodeId) {
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === fromTableId) {
                const seatsArray =
                  node.type === "chairNode"
                    ? node.data.chairs
                    : node.data.seats;
                const updatedSeats = seatsArray.map((seat) =>
                  seat.occupiedBy === guestId
                    ? { ...seat, occupiedBy: null, occupiedByName: null }
                    : seat
                );

                const updatedNode = {
                  ...node,
                  data: {
                    ...node.data,
                    ...(node.type === "chairNode"
                      ? { chairs: updatedSeats }
                      : { seats: updatedSeats }),
                  },
                };

                trackChange(fromTableId, "node", "updated", updatedNode);
                return updatedNode;
              }
              return node;
            })
          );
        }

        // Add to target table/chair
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === nodeId) {
              const seatsArray =
                node.type === "chairNode" ? node.data.chairs : node.data.seats;
              const targetSeatIndex = seatsArray.findIndex(
                (seat) => seat.id === seatId
              );

              if (targetSeatIndex === -1) {
                toast.error("Seat not found");
                return node;
              }

              if (seatsArray[targetSeatIndex].occupiedBy === guestId) {
                console.log("🚫 Target seat already has this guest!");
                return node;
              }

              const availableSeats = seatsArray
                .map((seat, index) => (!seat.occupiedBy ? index : -1))
                .filter((i) => i !== -1);

              if (availableSeats.length < totalSeatsNeeded) {
                toast.error(
                  `Not enough seats! Need ${totalSeatsNeeded} seat${
                    totalSeatsNeeded > 1 ? "s" : ""
                  }`
                );
                // ✅ Don't set wasSuccessfullySeated = true
                return node;
              }

              let consecutiveSeats: number[] = [];

              if (!seatsArray[targetSeatIndex].occupiedBy) {
                consecutiveSeats.push(targetSeatIndex);
              }

              if (consecutiveSeats.length < totalSeatsNeeded) {
                for (
                  let i = targetSeatIndex + 1;
                  i < seatsArray.length &&
                  consecutiveSeats.length < totalSeatsNeeded;
                  i++
                ) {
                  if (!seatsArray[i].occupiedBy) consecutiveSeats.push(i);
                  else break;
                }
              }

              if (consecutiveSeats.length < totalSeatsNeeded) {
                for (
                  let i = targetSeatIndex - 1;
                  i >= 0 && consecutiveSeats.length < totalSeatsNeeded;
                  i--
                ) {
                  if (!seatsArray[i].occupiedBy) consecutiveSeats.unshift(i);
                  else break;
                }
              }

              console.log("🪑 CONSECUTIVE SEATS FOUND:", consecutiveSeats);

              if (consecutiveSeats.length < totalSeatsNeeded) {
                toast.error(
                  `Cannot find ${totalSeatsNeeded} consecutive seats!`
                );
                // ✅ Don't set wasSuccessfullySeated = true
                return node;
              }

              const updatedSeats = seatsArray.map((seat, index) => {
                if (seat.id === fromSeatId && fromTableId === nodeId) {
                  return { ...seat, occupiedBy: null, occupiedByName: null };
                }

                if (consecutiveSeats.includes(index)) {
                  const seatPosition = consecutiveSeats.indexOf(index);
                  let displayName = guestName;

                  if (seatPosition === 0) {
                    displayName = guestName;
                  } else if (seatPosition <= (guest?.adults ?? 0)) {
                    displayName = `${guestName} (Adult ${seatPosition})`;
                  } else if (
                    seatPosition - (guest?.adults ?? 0) <=
                    (guest?.children ?? 0)
                  ) {
                    displayName = `${guestName} (Child ${
                      seatPosition - (guest?.adults ?? 0)
                    })`;
                  } else {
                    displayName = guestName;
                  }

                  return {
                    ...seat,
                    occupiedBy: guestId,
                    occupiedByName: displayName,
                  };
                }
                return seat;
              });

              const updatedNode = {
                ...node,
                data: {
                  ...node.data,
                  ...(node.type === "chairNode"
                    ? { chairs: updatedSeats }
                    : { seats: updatedSeats }),
                },
              };

              trackChange(nodeId, "node", "updated", updatedNode);

              // ✅ Mark as successfully seated
              wasSuccessfullySeated = true;

              return updatedNode;
            }
            return node;
          })
        );

        // ✅ Only update guest status if they were successfully seated
        if (!wasSuccessfullySeated) {
          console.log("❌ Guest was NOT seated - keeping isAssigned as false");
          return currentGuests; // Don't change anything
        }

        const updatedGuests = currentGuests.map((g) => {
          if (g._id === guestId) {
            const updatedGuest = { ...g, isAssigned: true };
            trackChange(guestId, "guest", "updated", updatedGuest);
            return updatedGuest;
          }
          return g;
        });

        const familyText =
          totalSeatsNeeded === 1
            ? `${guestName} assigned!`
            : `${guestName} and family assigned! (${totalSeatsNeeded} seats)`;

        toast.success(familyText);

        return updatedGuests;
      });
    },
    [setNodes, setGuests, trackChange]
  );

  const handleRemoveGuestFromSeat = useCallback(
    (nodeId: string, seatId: string, guestId: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const seatsArray =
              node.type === "chairNode" ? node.data.chairs : node.data.seats;

            // ✅ Remove ALL seats with this guest ID (entire family)
            const updatedSeats = seatsArray.map((seat) => {
              if (seat.occupiedBy === guestId) {
                return { ...seat, occupiedBy: null, occupiedByName: null };
              }
              return seat;
            });

            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                ...(node.type === "chairNode"
                  ? { chairs: updatedSeats }
                  : { seats: updatedSeats }),
              },
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

      toast.info(`Guest and family removed from seat.`);
    },
    [setNodes, setGuests, trackChange]
  );

  const handleDeleteTable = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const nodeToDelete = nds.find((n) => n.id === nodeId);
        if (nodeToDelete) {
          const seatsArray =
            nodeToDelete.type === "chairNode"
              ? nodeToDelete.data.chairs
              : nodeToDelete.data.seats;

          // ✅ Get unique guest IDs (family members share same ID)
          const uniqueGuestIds = new Set<string>();
          seatsArray.forEach((seat) => {
            if (seat.occupiedBy) {
              uniqueGuestIds.add(seat.occupiedBy);
            }
          });

          // ✅ Unassign all unique guests
          uniqueGuestIds.forEach((guestId) => {
            setGuests((prevGuests) =>
              prevGuests.map((guest) => {
                if (guest._id === guestId) {
                  const updatedGuest = { ...guest, isAssigned: false };
                  trackChange(guest._id, "guest", "updated", updatedGuest);
                  return updatedGuest;
                }
                return guest;
              })
            );
          });
        }
        return nds.filter((node) => node.id !== nodeId);
      });

      DeteTable(nodeId);
      const itemType = nodeToDelete?.type === "chairNode" ? "Chairs" : "Table";
      toast.info(`${itemType} removed.`);
    },
    [setNodes, setGuests, DeteTable, trackChange]
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
      // Allow unlimited movement - no constraints
      return { x, y };
    },
    []
  );
  // ✅ NEW: Dedicated handler for drag stop - tracks position changes reliably
  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: any) => {
      console.log("🎯 Node drag stopped:", node.id, node.position);

      // Get the latest node data from state
      const currentNode = nodes.find((n) => n.id === node.id);

      if (!currentNode) return;

      // Constrain position if needed
      const constrainedPosition = constrainTablePosition(
        node.position.x,
        node.position.y,
        currentNode.data.width,
        currentNode.data.height
      );

      // Create updated node with new position
      const updatedNode = {
        ...currentNode,
        position: constrainedPosition,
      };

      // ✅ Track based on node type
      if (currentNode.type === "chairNode") {
        const nodeForDB = {
          ...updatedNode,
          data: {
            ...updatedNode.data,
            seats: updatedNode.data.chairs || updatedNode.data.seats || [],
            numSeats:
              updatedNode.data.numChairs || updatedNode.data.numSeats || 0,
            chairs: undefined,
            numChairs: undefined,
          },
        };
        trackChange(node.id, "node", "updated", nodeForDB);
        console.log("✅ Chair position tracked:", node.id);
      } else if (currentNode.type === "tableNode") {
        trackChange(node.id, "node", "updated", updatedNode);
        console.log("✅ Table position tracked:", node.id);
      } else if (currentNode.type === "decorativeNode") {
        trackDecorativeChange(node.id, "updated", updatedNode);
        console.log("✅ Decorative item position tracked:", node.id);
      }

      // ✅ Update the node in React Flow state with constrained position
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, position: constrainedPosition } : n
        )
      );
    },
    [
      nodes,
      trackChange,
      trackDecorativeChange,
      constrainTablePosition,
      setNodes,
    ]
  );

  const handleConfirmAddTable = () => {
    if (!newTableType || !newTableLabel.trim()) {
      toast.error("Please provide a table name.");
      return;
    }

    // ✅ HANDLE LINE CREATION
    if (
      newTableType === "line-horizontal" ||
      newTableType === "line-vertical"
    ) {
      const lineThickness = tWidth || 5; // Thickness
      const lineLength = tHeight || 100; // Length

      const width =
        newTableType === "line-horizontal" ? lineLength : lineThickness;
      const height =
        newTableType === "line-vertical" ? lineLength : lineThickness;

      const newNodeId = uuidv4();
      const margin = 20;
      const randomX =
        Math.random() * (venueWidthPx - width - margin * 2) + margin;
      const randomY =
        Math.random() * (venueHeightPx - height - margin * 2) + margin;

      const newLineNode = {
        id: newNodeId,
        type: "decorativeNode",
        event_id: pathName.split("/").pop() as string,
        position: { x: randomX, y: randomY },
        data: {
          event_id: pathName.split("/").pop() as string,
          label: newTableLabel,
          imageUrl: "",
          width: width,
          height: height,
          category: newTableType, // "line-horizontal" or "line-vertical"
          onDeleteDecorative: handleDeleteDecorative,
          onEditDecorative: handleEditDecorative,
          onDecorativeResize: handleDecorativeResize,
        },
        style: { width: `${width}px`, height: `${height}px` },
      };

      setNodes((nds) => nds.concat(newLineNode));
      PostNewDecorator(newLineNode);
      trackDecorativeChange(newNodeId, "created", newLineNode);

      setTimeout(() => zoomToNewTable({ x: randomX, y: randomY }), 300);
      setIsAddTableDialogOpen(false);
      setTWidth(0);
      setTHeight(0);
      toast.success(`${newTableLabel} line added successfully!`);
      return;
    }

    if (newTableType === "chair-row" || newTableType === "chair-column") {
      const chairs = Array.from({ length: newTableNumSeats }, () => ({
        id: uuidv4(),
        occupiedBy: null,
        occupiedByName: null,
      }));

      const chairWidth = 40;
      const chairHeight = 40;
      const chairSpacing = 10;

      const width =
        newTableType === "chair-row"
          ? newTableNumSeats * (chairWidth + chairSpacing) + 20
          : chairWidth + 20;

      const height =
        newTableType === "chair-column"
          ? newTableNumSeats * (chairHeight + chairSpacing) + 40
          : chairHeight + 40;

      const newNodeId = uuidv4();
      const margin = 20;
      const randomX =
        Math.random() * (venueWidthPx - width - margin * 2) + margin;
      const randomY =
        Math.random() * (venueHeightPx - height - margin * 2) + margin;

      // ✅ For React Flow - use 'chairs'
      const newNodeData = {
        id: newNodeId,
        type: "chairNode",
        event_id: pathName.split("/").pop() as string,
        position: { x: randomX, y: randomY },
        data: {
          event_id: pathName.split("/").pop() as string,
          label: newTableLabel,
          type: newTableType,
          chairs: chairs,
          numChairs: newTableNumSeats,
          width: width,
          height: height,
          onGuestDrop: callbacksRef.current.handleGuestDrop,
          onRemoveGuestFromChair:
            callbacksRef.current.handleRemoveGuestFromSeat,
          onDeleteChair: callbacksRef.current.handleDeleteTable,
          onEditChair: callbacksRef.current.handleEditTable,
        },
        style: { width: `${width}px`, height: `${height}px` },
      };

      // ✅ For Database - convert 'chairs' to 'seats'
      const nodeDataForDB = {
        id: newNodeId,
        type: "chairNode",
        event_id: pathName.split("/").pop() as string,
        position: { x: randomX, y: randomY },
        data: {
          event_id: pathName.split("/").pop() as string,
          label: newTableLabel,
          type: newTableType,
          seats: chairs,
          numSeats: newTableNumSeats,
          width: width,
          height: height,
        },
        style: { width: `${width}px`, height: `${height}px` },
      };

      const newNode = newNodeData;

      SeatPlan(nodeDataForDB);
      setNodes((nds) => nds.concat(newNode));
      trackChange(newNodeId, "node", "created", nodeDataForDB);
      setTimeout(() => zoomToNewTable({ x: randomX, y: randomY }), 300);
      setIsAddTableDialogOpen(false);
      toast.success(`${newTableLabel} added successfully!`);
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
    setTimeout(() => {
      zoomToNewTable(constrainedPosition);
    }, 300);
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

  const handleDeleteDecorative = useCallback(
    (nodeId: string) => {
      const nodeToDelete = nodes.find((n) => n.id === nodeId);
      if (nodeToDelete) {
        trackDecorativeChange(nodeId, "deleted", nodeToDelete);
      }

      setNodes((nds) => nds.filter((node) => node.id !== nodeId));

      toast.info("Decorative item removed.");
      DeleteDeco(nodeId);
    },
    [nodes, trackDecorativeChange]
  );

  // ✅ ADD THIS NEW FUNCTION - Handle line/decorative item resize
  const handleDecorativeResize = useCallback(
    (nodeId: string, newWidth: number, newHeight: number) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId && node.type === "decorativeNode") {
            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                width: newWidth,
                height: newHeight,
              },
              style: {
                ...node.style,
                width: `${newWidth}px`,
                height: `${newHeight}px`,
              },
            };

            // Track the change for database update
            trackDecorativeChange(nodeId, "updated", updatedNode);

            return updatedNode;
          }
          return node;
        })
      );
    },
    [setNodes, trackDecorativeChange]
  );
  const handleEditDecorative = useCallback(
    (nodeId: string, newLabel: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId && node.type === "decorativeNode") {
            const updatedNode = {
              ...node,
              data: { ...node.data, label: newLabel },
            };

            // Track the change
            trackDecorativeChange(nodeId, "updated", updatedNode);

            // Add API call here to update in your decorative items schema
            // updateDecorativeItem(nodeId, updatedNode);

            return updatedNode;
          }
          return node;
        })
      );
      toast.success("Decorative item updated.");
    },
    [trackDecorativeChange]
  );

  const handleDecorativeDrop = useCallback(
    (event: React.DragEvent) => {
      const decorativeItemId = event.dataTransfer.getData("decorativeItemId");
      const decorativeItemLabel = event.dataTransfer.getData(
        "decorativeItemLabel"
      );
      const decorativeItemImage = event.dataTransfer.getData(
        "decorativeItemImage"
      );
      const decorativeItemWidth = parseInt(
        event.dataTransfer.getData("decorativeItemWidth")
      );
      const decorativeItemHeight = parseInt(
        event.dataTransfer.getData("decorativeItemHeight")
      );

      if (!decorativeItemId) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newDecorativeId = uuidv4();
      const newDecorativeNode = {
        id: newDecorativeId,
        type: "decorativeNode",
        position: constrainTablePosition(
          position.x,
          position.y,
          decorativeItemWidth,
          decorativeItemHeight
        ),
        data: {
          event_id: pathName.split("/").pop() as string,
          label: decorativeItemLabel,
          imageUrl: "",
          width: decorativeItemWidth,
          height: decorativeItemHeight,
          category: decorativeItemId,
          onDeleteDecorative: handleDeleteDecorative,
          onEditDecorative: handleEditDecorative,
          onDecorativeResize: handleDecorativeResize,
        },
      };

      console.log("newDecorativeNode->", newDecorativeNode);

      setNodes((nds) => nds.concat(newDecorativeNode));
      PostNewDecorator(newDecorativeNode);
      // Track the new decorative item
      trackDecorativeChange(newDecorativeId, "created", newDecorativeNode);

      // Add API call here to save decorative item to your separate schema
      // saveDecorativeItem(newDecorativeNode);

      /*  toast.success(`${decorativeItemLabel} added successfully!`); */
    },
    [
      screenToFlowPosition,
      constrainTablePosition,
      pathName,
      handleDeleteDecorative,
      handleEditDecorative,
      setNodes,
      PostNewDecorator,
      trackDecorativeChange,
      handleDecorativeResize,
    ]
  );

  const handleNodesChange = useCallback(
    (changes: any[]) => {
      changes.forEach((change) => {
        if (
          change.type === "position" &&
          change.position &&
          change.dragging === false
        ) {
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
            console.log("node-types-<->", node.type);
            // Update the change object with constrained position
            change.position = constrainedPosition;

            if (node.type === "chairNode") {
              const nodeForDB = {
                ...updatedNode,
                data: {
                  ...updatedNode.data,
                  seats:
                    updatedNode.data.chairs || updatedNode.data.seats || [],
                  numSeats:
                    updatedNode.data.numChairs ||
                    updatedNode.data.numSeats ||
                    0,
                  chairs: undefined,
                  numChairs: undefined,
                },
              };
              trackChange(change.id, "node", "updated", nodeForDB);
            } else if (node.type === "tableNode") {
              trackChange(change.id, "node", "updated", updatedNode);
            } else if (node.type === "decorativeNode") {
              trackDecorativeChange(change.id, "updated", updatedNode);
            }
          }
        }
      });
      onNodesChange(changes);
    },
    [
      onNodesChange,
      nodes,
      trackChange,
      constrainTablePosition,
      trackDecorativeChange,
    ]
  );

  const handleSaveChanges = useCallback(() => {
    const totalChanges =
      changedObjects.guest.length +
      changedObjects.node.length +
      changedObjects.decorativeItems.length;
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

    if (changedObjects.decorativeItems.length > 0) {
      // Add API call to save decorative items
      // updateDecorativeItems(changedObjects.decorativeItems);
      console.log("Decorative items to save:", changedObjects.decorativeItems);

      UpdateDecorator(changedObjects.decorativeItems);
    }
  }, [changedObjects, updateSeatAll, updateAllguest]);

  useEffect(() => {
    if (data?.data) {
      setGuests(data.data);
    }
  }, [data]);

  // uncomment this after db setup
  const createDecorativeNodeWithCallbacks = (nodeData: any) => ({
    ...nodeData,
    data: {
      ...nodeData.data,
      onDeleteDecorative: handleDeleteDecorative,
      onEditDecorative: handleEditDecorative,
      onDecorativeResize: handleDecorativeResize,
    },
  });

  // Updated useEffect to load both table nodes and decorative items
  useEffect(() => {
    const allNodes: any[] = [];

    console.log("setplan data", seatPlandata);

    // Load table nodes
    if (seatPlandata?.data && seatPlandata.data.length > 0) {
      const tableNodesWithCallbacks = seatPlandata.data.map((nodeData: any) => {
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
        if (nodeData.type === "chairNode") {
          return {
            ...constrainedNode,
            data: {
              ...constrainedNode.data,
              chairs: constrainedNode.data.seats || [], // ✅ Convert seats → chairs
              numChairs: constrainedNode.data.numSeats || 0, // ✅ Convert numSeats → numChairs
              onGuestDrop: callbacksRef.current.handleGuestDrop,
              onRemoveGuestFromChair:
                callbacksRef.current.handleRemoveGuestFromSeat,
              onDeleteChair: callbacksRef.current.handleDeleteTable,
              onEditChair: callbacksRef.current.handleEditTable,
            },
          };
        }
        return createNodeWithCallbacks(constrainedNode);
      });

      allNodes.push(...tableNodesWithCallbacks);
    }

    // Load decorative items
    if (DecoratorData?.data && DecoratorData.data.length > 0) {
      const decorativeNodesWithCallbacks = DecoratorData.data.map(
        (nodeData: any) => {
          // Constrain existing decorative items within venue bounds
          const constrainedPosition = constrainTablePosition(
            nodeData.position.x,
            nodeData.position.y,
            nodeData.data.width || 80,
            nodeData.data.height || 80
          );

          const constrainedNode = {
            ...nodeData,
            position: constrainedPosition,
            type: "decorativeNode", // Ensure correct type
          };
          return createDecorativeNodeWithCallbacks(constrainedNode);
        }
      );

      allNodes.push(...decorativeNodesWithCallbacks);
    }

    // Set all nodes at once
    setNodes(allNodes);

    // Set initial centered viewport after a small delay
    setTimeout(() => {
      const initialViewport = getInitialViewport();
      setViewport(initialViewport, { duration: 800 });
    }, 200);
  }, [
    seatPlandata?.data,
    DecoratorData?.data, // Add this dependency
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

    const reactFlowPane =
      reactFlowWrapper.current.querySelector(".react-flow__pane");
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
    if (changedObjects.decorativeItems.length > 0) {
      UpdateDecorator(changedObjects.decorativeItems);
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
      {/* <DecorativeSidebar onAddDecorativeItem={() => {}} /> */}
      <div className="flex-grow h-full relative" ref={reactFlowWrapper}>
        {/* Zoom-Responsive Venue Boundary */}
        {/*  <ZoomResponsiveBoundary
          venueWidth={venueWidth}
          venueHeight={venueHeight}
          SCALE_FACTOR={SCALE_FACTOR}
        /> */}
        <ZoomResponsiveBoundary
          venueWidth={venueWidth}
          venueHeight={venueHeight}
          SCALE_FACTOR={SCALE_FACTOR}
          venu_id={pathName.split("/").pop() as string}
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
              changedObjects.guest.length +
                changedObjects.node.length +
                changedObjects.decorativeItems.length ===
              0
            }
          >
            <Database className="w-4 h-4 mr-2" />
            Save Changes (
            {changedObjects.guest.length +
              changedObjects.node.length +
              changedObjects.decorativeItems.length}
            )
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
          onNodeDragStop={handleNodeDragStop}
          /*      onMoveEnd={onMoveEnd} */
          minZoom={0.05}
          maxZoom={2}
          onDrop={handleDecorativeDrop}
          onDragOver={(event) => event.preventDefault()}
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
              {newTableType?.includes("line")
                ? "Line"
                : newTableType
                ? newTableType.charAt(0).toUpperCase() + newTableType.slice(1)
                : ""}{" "}
              {!newTableType?.includes("line") && "Table"}
            </DialogTitle>
            <DialogDescription>
              {newTableType?.includes("line")
                ? "Configure the line thickness and initial length. You can drag to adjust length after creation."
                : `Configure the details for your new table/chair. Tables will be placed within the venue area (${venueWidth}m × ${venueHeight}m). Estimated capacity: ~${estimatedCapacity} tables total.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="tableName" className="text-right">
                {newTableType?.includes("line") ? "Line" : "Table/Chair"} Name :
              </Label>
              <Input
                id="tableName"
                value={newTableLabel}
                onChange={(e) => setNewTableLabel(e.target.value)}
                className="col-span-3"
                placeholder={
                  newTableType?.includes("line")
                    ? "e.g., Wall, Divider"
                    : "e.g., Wedding Table, Fancy Table"
                }
              />
            </div>

            {/* ✅ LINE-SPECIFIC INPUTS */}
            {newTableType?.includes("line") && (
              <>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="lineThickness" className="text-right">
                    Thickness (px):
                  </Label>
                  <Input
                    id="lineThickness"
                    type="number"
                    value={tWidth > 0 ? tWidth : ""}
                    onChange={(e) => setTWidth(Number(e.target.value))}
                    className="col-span-3"
                    placeholder="e.g., 5"
                    min={1}
                    max={50}
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="lineLength" className="text-right">
                    Initial Length (px):
                  </Label>
                  <Input
                    id="lineLength"
                    type="number"
                    value={tHeight > 0 ? tHeight : ""}
                    onChange={(e) => setTHeight(Number(e.target.value))}
                    className="col-span-3"
                    placeholder="e.g., 200"
                    min={10}
                    max={2000}
                  />
                </div>
              </>
            )}

            {/* TABLE/CHAIR SEAT COUNT - HIDE FOR LINES */}
            {!newTableType?.includes("line") &&
              newTableType !== "circular-single-seat" && (
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="numSeats" className="text-right">
                    Number of Seats :
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

            {/* TABLE MEASUREMENT INPUTS - HIDE FOR LINES */}
            {!newTableType?.includes("line") && (
              <>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="tableName" className="text-right">
                    Measurement Type:
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
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="tableName" className="text-right">
                    Table/chair width :
                  </Label>
                  <Input
                    id="tableName"
                    value={tWidth > 0 ? tWidth : ""}
                    onChange={(e) => setTWidth(Number(e.target.value))}
                    className="col-span-3"
                    placeholder="e.g., 2.5"
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="tableName" className="text-right">
                    Table/chair height :
                  </Label>
                  <Input
                    id="tableName"
                    value={tHeight > 0 ? tHeight : ""}
                    onChange={(e) => setTHeight(Number(e.target.value))}
                    className="col-span-3"
                    placeholder="e.g., 1.5"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleConfirmAddTable}>
              Add {newTableType?.includes("line") ? "Line" : "Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WeddingPlannerWrapper() {
  return (
    <ReactFlowProvider>
      <WeddingPlanner />
    </ReactFlowProvider>
  );
}
