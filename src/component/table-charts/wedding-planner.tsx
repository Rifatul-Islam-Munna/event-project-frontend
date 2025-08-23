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
import { Menu, FileText, Database } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import type { Guest } from "@/@types/events-details";
import { usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteGuest,
  deleteSeatPlan,
  getAllGuest,
  getAllSeatPlan,
  postSeatPlan,
  updateBulkGuest,
  updateSeatPlan,
} from "@/actions/fetch-action";
import { useIdleTimer } from "react-idle-timer";
import { useStore } from "@/zustan-fn/save-alert";

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

function WeddingPlanner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [guests, setGuests] = useState<Guest[]>([]);

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
  const { screenToFlowPosition, setViewport, getNodes, fitView, getViewport } =
    useReactFlow();
  console.log("changes", changedObjects);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Use refs to store stable callback references
  const callbacksRef = useRef({
    handleGuestDrop: null as any,
    handleRemoveGuestFromSeat: null as any,
    handleDeleteTable: null as any,
    handleEditTable: null as any,
  });

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
    setIsAddTableDialogOpen(true);
  };

  // Create stable callback functions using useCallback
  const handleGuestDrop = useCallback(
    (event: React.DragEvent, nodeId: string, seatId: string) => {
      event.preventDefault();
      const guestId = event.dataTransfer.getData("guestId");
      const guestName = event.dataTransfer.getData("guestName");

      if (!guestId || !guestName) {
        toast.error("Invalid guest data");
        return;
      }

      // Update the node with the new seat assignment
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // Check if seat is already occupied
            const targetSeat = node.data.seats.find(
              (seat) => seat.id === seatId
            );
            if (targetSeat?.occupiedBy) {
              toast.error("This seat is already occupied");
              return node;
            }

            // Check if guest is already assigned to another seat in this node
            const isGuestAlreadyAssigned = node.data.seats.some(
              (seat) => seat.occupiedBy === guestId
            );
            if (isGuestAlreadyAssigned) {
              toast.error("Guest is already assigned to another seat");
              return node;
            }

            const updatedSeats = node.data.seats.map((seat) => {
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

      // Update guest status
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

      toast.success(`${guestName} assigned to seat successfully!`);
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
    const newNodeData = {
      id: newNodeId,
      type: "tableNode",
      event_id: pathName.split("/").pop() as string,
      position: { x: 50, y: 50 },
      data: {
        event_id: pathName.split("/").pop() as string,
        label: newTableLabel,
        type: newTableType,
        seats,
        width,
        height,
        numSeats: newTableNumSeats,
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
            const updatedNode = {
              ...node,
              position: change.position,
            };
            trackChange(change.id, "node", "updated", updatedNode);
          }
        }
      });
      onNodesChange(changes);
    },
    [onNodesChange, nodes, trackChange]
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

  // Load seat plan data - only run once when data is available
  useEffect(() => {
    if (seatPlandata?.data && seatPlandata.data.length > 0) {
      const nodesWithCallbacks = seatPlandata.data.map(createNodeWithCallbacks);
      setNodes(nodesWithCallbacks);
    }
  }, [seatPlandata?.data]); // Only depend on the actual data

  const handleDownloadPdf = useCallback(() => {
    if (reactFlowWrapper.current) {
      const reactFlowPane = reactFlowWrapper.current.querySelector(
        ".react-flow__pane"
      ) as HTMLElement;
      const reactFlowControls = reactFlowWrapper.current.querySelector(
        ".react-flow__controls"
      ) as HTMLElement;
      const reactFlowMiniMap = reactFlowWrapper.current.querySelector(
        ".react-flow__minimap"
      ) as HTMLElement;

      if (reactFlowPane) {
        const initialViewport = getViewport();

        if (reactFlowControls) reactFlowControls.style.display = "none";
        if (reactFlowMiniMap) reactFlowMiniMap.style.display = "none";

        fitView({ padding: 0.1, includeHiddenNodes: true });

        setTimeout(() => {
          htmlToImage
            .toPng(reactFlowPane, {
              quality: 0.95,
              pixelRatio: 2,
              backgroundColor: "#ffffff",
            })
            .then((dataUrl) => {
              const img = new Image();
              img.src = dataUrl;

              img.onload = () => {
                const pdf = new jsPDF({
                  orientation:
                    img.width > img.height ? "landscape" : "portrait",
                  unit: "px",
                  format: [img.width, img.height],
                });

                pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
                pdf.save("wedding-layout.pdf");
                toast.success("Layout downloaded as PDF!");

                setViewport(initialViewport);
                if (reactFlowControls) reactFlowControls.style.display = "";
                if (reactFlowMiniMap) reactFlowMiniMap.style.display = "";
              };
            })
            .catch((error) => {
              console.error("oops, something went wrong!", error);
              toast.error("Failed to download PDF.");
              setViewport(initialViewport);
              if (reactFlowControls) reactFlowControls.style.display = "";
              if (reactFlowMiniMap) reactFlowMiniMap.style.display = "";
            });
        }, 100);
      } else {
        toast.error("React Flow pane not found for PDF capture.");
      }
    } else {
      toast.error("React Flow container not found for PDF capture.");
    }
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
        <Button
          variant="outline"
          size="icon"
          className="md:hidden absolute top-4 left-4 z-20 bg-transparent"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

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
          <Button onClick={handleDownloadPdf} variant="outline">
            <FileText className="w-4 h-4 mr-2" /> Download PDF
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
          fitView
          className="bg-transparent"
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
              Configure the details for your new table.
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
