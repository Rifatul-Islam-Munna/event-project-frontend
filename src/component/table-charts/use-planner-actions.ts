"use client";

import { useCallback, useEffect } from "react";
import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from "react";
import type Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import type { Guest } from "@/@types/events-details";
import type {
  ChairPlannerNode,
  DecorativePlannerNode,
  EditDialogState,
  GuestDragState,
  LineResizeHandle,
  LineResizeState,
  PlannerNode,
  Point,
  SeatHitTarget,
  SeatingPlannerNode,
  TablePlannerNode,
  TableType,
} from "./planner-types";
import {
  calculateChairNodeDimensions,
  calculateTableDimensions,
  clamp,
  getSeatingNodeSeats,
  isChairNode,
  serializeDecorativeNode,
  serializeSeatPlanNode,
  snapPoint,
  updateSeatingNodeSeats,
} from "./planner-utils";

interface UsePlannerActionsArgs {
  clientToWorld: (clientX: number, clientY: number) => Point | null;
  clearTrackedDecorative: (nodeId: string) => void;
  clearTrackedGuest: (guestId: string) => void;
  clearTrackedNode: (nodeId: string) => void;
  createDecorativeNode: (payload: ReturnType<typeof serializeDecorativeNode>) => void;
  createSeatPlanNode: (payload: ReturnType<typeof serializeSeatPlanNode>) => void;
  deleteDecorativeNodeMutation: (nodeId: string) => void;
  deleteGuestMutation: (guestId: string) => void;
  deleteSeatPlanNode: (nodeId: string) => void;
  editDialogState: EditDialogState | null;
  eventId: string;
  findSeatTarget: (point: Point) => SeatHitTarget | null;
  guestsRef: MutableRefObject<Guest[]>;
  guestDragState: GuestDragState | null;
  lineResizeState: LineResizeState | null;
  measurementType: string;
  newTableLabel: string;
  newTableNumSeats: number;
  newTableType: TableType | null;
  nodesRef: MutableRefObject<PlannerNode[]>;
  setEditDialogState: Dispatch<SetStateAction<EditDialogState | null>>;
  setGuests: Dispatch<SetStateAction<Guest[]>>;
  setGuestDragState: Dispatch<SetStateAction<GuestDragState | null>>;
  setIsAddTableDialogOpen: Dispatch<SetStateAction<boolean>>;
  setLineResizeState: Dispatch<SetStateAction<LineResizeState | null>>;
  setMeasurementType: Dispatch<SetStateAction<string>>;
  setNewTableLabel: Dispatch<SetStateAction<string>>;
  setNewTableNumSeats: Dispatch<SetStateAction<number>>;
  setNewTableType: Dispatch<SetStateAction<TableType | null>>;
  setNodes: Dispatch<SetStateAction<PlannerNode[]>>;
  setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
  setTableHeightInput: Dispatch<SetStateAction<number>>;
  setTableWidthInput: Dispatch<SetStateAction<number>>;
  stageRef: MutableRefObject<Konva.Stage | null>;
  tableHeightInput: number;
  tableWidthInput: number;
  trackDecorativeChange: (node: DecorativePlannerNode) => void;
  trackGuestChange: (guest: Guest) => void;
  trackSeatPlanChange: (node: SeatingPlannerNode) => void;
  venueHeightPx: number;
  venueWidthPx: number;
  viewportRef: MutableRefObject<{ x: number; y: number; zoom: number }>;
  zoomToNode: (position: Point) => void;
}

export function usePlannerActions({
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
}: UsePlannerActionsArgs) {
  const assignGuestToSeat = useCallback(
    ({
      guestId,
      guestName,
      targetNodeId,
      targetSeatId,
      fromNodeId,
    }: {
      guestId: string;
      guestName: string;
      targetNodeId: string;
      targetSeatId: string;
      fromNodeId?: string;
    }) => {
      const currentGuests = guestsRef.current;
      const guest = currentGuests.find((item) => item._id === guestId);

      if (!guest) {
        toast.error("Guest not found");
        return;
      }

      const totalSeatsNeeded = Math.max(
        1,
        (guest.adults ?? 0) + (guest.children ?? 0),
      );

      let nextNodes = [...nodesRef.current];
      const targetNodeIndex = nextNodes.findIndex((node) => node.id === targetNodeId);

      if (targetNodeIndex === -1) {
        toast.error("Seat target not found");
        return;
      }

      const rawTargetNode = nextNodes[targetNodeIndex];

      if (rawTargetNode.type === "decorativeNode") {
        toast.error("Cannot assign a guest there");
        return;
      }

      let workingTargetSeats = [...getSeatingNodeSeats(rawTargetNode)];

      if (fromNodeId) {
        nextNodes = nextNodes.map((node) => {
          if (node.id !== fromNodeId || node.type === "decorativeNode") {
            return node;
          }

          const clearedSeats = getSeatingNodeSeats(node).map((seat) =>
            seat.occupiedBy === guestId
              ? { ...seat, occupiedBy: null, occupiedByName: null }
              : seat,
          );

          const updatedNode = updateSeatingNodeSeats(node, clearedSeats);

          if (fromNodeId !== targetNodeId) {
            trackSeatPlanChange(updatedNode);
          }

          if (updatedNode.id === targetNodeId) {
            workingTargetSeats = [...getSeatingNodeSeats(updatedNode)];
          }

          return updatedNode;
        });
      }

      if (
        workingTargetSeats.some(
          (seat) => seat.occupiedBy === guestId && fromNodeId !== targetNodeId,
        )
      ) {
        toast.error("Guest is already seated here");
        return;
      }

      const targetSeatIndex = workingTargetSeats.findIndex(
        (seat) => seat.id === targetSeatId,
      );

      if (targetSeatIndex === -1) {
        toast.error("Seat not found");
        return;
      }

      const availableSeatIndexes = workingTargetSeats
        .map((seat, index) => (!seat.occupiedBy ? index : -1))
        .filter((index) => index !== -1);

      if (availableSeatIndexes.length < totalSeatsNeeded) {
        toast.error(
          `Not enough seats. Need ${totalSeatsNeeded} seat${totalSeatsNeeded > 1 ? "s" : ""}.`,
        );
        return;
      }

      const consecutiveIndexes: number[] = [];

      if (!workingTargetSeats[targetSeatIndex].occupiedBy) {
        consecutiveIndexes.push(targetSeatIndex);
      }

      for (
        let nextIndex = targetSeatIndex + 1;
        nextIndex < workingTargetSeats.length &&
        consecutiveIndexes.length < totalSeatsNeeded;
        nextIndex += 1
      ) {
        if (!workingTargetSeats[nextIndex].occupiedBy) {
          consecutiveIndexes.push(nextIndex);
        } else {
          break;
        }
      }

      for (
        let previousIndex = targetSeatIndex - 1;
        previousIndex >= 0 && consecutiveIndexes.length < totalSeatsNeeded;
        previousIndex -= 1
      ) {
        if (!workingTargetSeats[previousIndex].occupiedBy) {
          consecutiveIndexes.unshift(previousIndex);
        } else {
          break;
        }
      }

      if (consecutiveIndexes.length < totalSeatsNeeded) {
        toast.error(`Cannot find ${totalSeatsNeeded} consecutive seats.`);
        return;
      }

      const updatedTargetSeats = workingTargetSeats.map((seat, index) => {
        if (!consecutiveIndexes.includes(index)) {
          return seat;
        }

        const seatPosition = consecutiveIndexes.indexOf(index);
        let displayName = guestName;

        if (seatPosition === 0) {
          displayName = guestName;
        } else if (seatPosition <= (guest.adults ?? 0)) {
          displayName = `${guestName} (Adult ${seatPosition})`;
        } else if (seatPosition - (guest.adults ?? 0) <= (guest.children ?? 0)) {
          displayName = `${guestName} (Child ${seatPosition - (guest.adults ?? 0)})`;
        }

        return {
          ...seat,
          occupiedBy: guestId,
          occupiedByName: displayName,
        };
      });

      const updatedNodes = nextNodes.map((node) => {
        if (node.id !== targetNodeId || node.type === "decorativeNode") {
          return node;
        }

        const updatedNode = updateSeatingNodeSeats(node, updatedTargetSeats);
        trackSeatPlanChange(updatedNode);
        return updatedNode;
      });

      const updatedGuests = currentGuests.map((item) => {
        if (item._id !== guestId) {
          return item;
        }

        const updatedGuest = { ...item, isAssigned: true };
        trackGuestChange(updatedGuest);
        return updatedGuest;
      });

      setNodes(updatedNodes);
      setGuests(updatedGuests);

      toast.success(
        totalSeatsNeeded === 1
          ? `${guestName} assigned.`
          : `${guestName} and family assigned.`,
      );
    },
    [guestsRef, nodesRef, setGuests, setNodes, trackGuestChange, trackSeatPlanChange],
  );

  const handleRemoveGuestFromSeat = useCallback(
    (nodeId: string, _seatId: string, guestId: string) => {
      const nextNodes = nodesRef.current.map((node) => {
        if (node.id !== nodeId || node.type === "decorativeNode") {
          return node;
        }

        const clearedSeats = getSeatingNodeSeats(node).map((seat) =>
          seat.occupiedBy === guestId
            ? { ...seat, occupiedBy: null, occupiedByName: null }
            : seat,
        );

        const updatedNode = updateSeatingNodeSeats(node, clearedSeats);
        trackSeatPlanChange(updatedNode);
        return updatedNode;
      });

      const nextGuests = guestsRef.current.map((guest) => {
        if (guest._id !== guestId) {
          return guest;
        }

        const updatedGuest = { ...guest, isAssigned: false };
        trackGuestChange(updatedGuest);
        return updatedGuest;
      });

      setNodes(nextNodes);
      setGuests(nextGuests);
      toast.info("Guest and family removed from seat.");
    },
    [guestsRef, nodesRef, setGuests, setNodes, trackGuestChange, trackSeatPlanChange],
  );

  const openEditDialog = useCallback((node: PlannerNode) => {
    if (node.type === "decorativeNode") {
      if (
        node.data.category === "line-horizontal" ||
        node.data.category === "line-vertical"
      ) {
        return;
      }

      setEditDialogState({
        nodeId: node.id,
        kind: "decorativeNode",
        label: node.data.label,
        seatsOrChairs: 0,
      });
      return;
    }

    setEditDialogState({
      nodeId: node.id,
      kind: node.type,
      label: node.data.label,
      seatsOrChairs: isChairNode(node) ? node.data.numChairs : node.data.numSeats,
    });
  }, [setEditDialogState]);

  const handleEditConfirm = useCallback(() => {
    if (!editDialogState) {
      return;
    }

    const node = nodesRef.current.find((item) => item.id === editDialogState.nodeId);

    if (!node) {
      setEditDialogState(null);
      return;
    }

    if (node.type === "decorativeNode") {
      const updatedNode: DecorativePlannerNode = {
        ...node,
        data: {
          ...node.data,
          label: editDialogState.label,
        },
      };

      setNodes((previous) =>
        previous.map((item) => (item.id === updatedNode.id ? updatedNode : item)),
      );
      trackDecorativeChange(updatedNode);
      toast.success("Decorative item updated.");
      setEditDialogState(null);
      return;
    }

    if (node.type === "chairNode") {
      const nextCount = clamp(editDialogState.seatsOrChairs, 1, 50);
      const currentSeats = [...node.data.chairs];

      if (nextCount > currentSeats.length) {
        for (let index = currentSeats.length; index < nextCount; index += 1) {
          currentSeats.push({
            id: uuidv4(),
            occupiedBy: null,
            occupiedByName: null,
          });
        }
      } else if (nextCount < currentSeats.length) {
        const removedSeats = currentSeats.splice(nextCount);
        const removedGuestIds = new Set(
          removedSeats
            .map((seat) => seat.occupiedBy)
            .filter((guestId): guestId is string => Boolean(guestId)),
        );

        if (removedGuestIds.size > 0) {
          setGuests((previousGuests) =>
            previousGuests.map((guest) => {
              if (!guest._id || !removedGuestIds.has(guest._id)) {
                return guest;
              }

              const updatedGuest = { ...guest, isAssigned: false };
              trackGuestChange(updatedGuest);
              return updatedGuest;
            }),
          );
        }
      }

      const dimensions = calculateChairNodeDimensions(node.data.type, nextCount);
      const updatedNode: ChairPlannerNode = {
        ...node,
        data: {
          ...node.data,
          label: editDialogState.label,
          chairs: currentSeats,
          numChairs: nextCount,
          width: dimensions.width,
          height: dimensions.height,
        },
        style: {
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        },
      };

      setNodes((previous) =>
        previous.map((item) => (item.id === updatedNode.id ? updatedNode : item)),
      );
      trackSeatPlanChange(updatedNode);
      toast.success(`"${editDialogState.label}" updated.`);
      setEditDialogState(null);
      return;
    }

    const nextCount =
      node.data.type === "circular-single-seat"
        ? 1
        : clamp(editDialogState.seatsOrChairs, 1, 20);
    const currentSeats = [...node.data.seats];

    if (nextCount > currentSeats.length) {
      for (let index = currentSeats.length; index < nextCount; index += 1) {
        currentSeats.push({
          id: uuidv4(),
          occupiedBy: null,
          occupiedByName: null,
        });
      }
    } else if (nextCount < currentSeats.length) {
      const removedSeats = currentSeats.splice(nextCount);
      const removedGuestIds = new Set(
        removedSeats
          .map((seat) => seat.occupiedBy)
          .filter((guestId): guestId is string => Boolean(guestId)),
      );

      if (removedGuestIds.size > 0) {
        setGuests((previousGuests) =>
          previousGuests.map((guest) => {
            if (!guest._id || !removedGuestIds.has(guest._id)) {
              return guest;
            }

            const updatedGuest = { ...guest, isAssigned: false };
            trackGuestChange(updatedGuest);
            return updatedGuest;
          }),
        );
      }
    }

    const dimensions = calculateTableDimensions(node.data.type, nextCount);
    const updatedNode: TablePlannerNode = {
      ...node,
      data: {
        ...node.data,
        label: editDialogState.label,
        seats: currentSeats,
        numSeats: nextCount,
        width: dimensions.width,
        height: dimensions.height,
      },
      style: {
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      },
    };

    setNodes((previous) =>
      previous.map((item) => (item.id === updatedNode.id ? updatedNode : item)),
    );
    trackSeatPlanChange(updatedNode);
    toast.success(`Table "${editDialogState.label}" updated.`);
    setEditDialogState(null);
  }, [
    editDialogState,
    nodesRef,
    setEditDialogState,
    setGuests,
    setNodes,
    trackDecorativeChange,
    trackGuestChange,
    trackSeatPlanChange,
  ]);

  const handleDeleteSeatPlanNode = useCallback(
    (nodeId: string) => {
      const node = nodesRef.current.find((item) => item.id === nodeId);

      if (!node || node.type === "decorativeNode") {
        return;
      }

      const guestIds = new Set(
        getSeatingNodeSeats(node)
          .map((seat) => seat.occupiedBy)
          .filter((guestId): guestId is string => Boolean(guestId)),
      );

      const nextGuests = guestsRef.current.map((guest) => {
        if (!guest._id || !guestIds.has(guest._id)) {
          return guest;
        }

        const updatedGuest = { ...guest, isAssigned: false };
        trackGuestChange(updatedGuest);
        return updatedGuest;
      });

      const nextNodes = nodesRef.current.filter((item) => item.id !== nodeId);

      setGuests(nextGuests);
      setNodes(nextNodes);
      setSelectedNodeId((previous) => (previous === nodeId ? null : previous));
      clearTrackedNode(nodeId);
      deleteSeatPlanNode(nodeId);
      toast.info(node.type === "chairNode" ? "Chairs removed." : "Table removed.");
    },
    [
      clearTrackedNode,
      deleteSeatPlanNode,
      guestsRef,
      nodesRef,
      setGuests,
      setNodes,
      setSelectedNodeId,
      trackGuestChange,
    ],
  );

  const handleDeleteDecorative = useCallback(
    (nodeId: string) => {
      setNodes((previous) => previous.filter((item) => item.id !== nodeId));
      setSelectedNodeId((previous) => (previous === nodeId ? null : previous));
      clearTrackedDecorative(nodeId);
      deleteDecorativeNodeMutation(nodeId);
      toast.info("Decorative item removed.");
    },
    [
      clearTrackedDecorative,
      deleteDecorativeNodeMutation,
      setNodes,
      setSelectedNodeId,
    ],
  );

  const handleNodeDragMove = useCallback((nodeId: string, position: Point) => {
    setNodes((previous) =>
      previous.map((node) =>
        node.id === nodeId ? { ...node, position } : node,
      ),
    );
  }, [setNodes]);

  const handleNodeDragEnd = useCallback(
    (nodeId: string, position: Point) => {
      const snappedPosition = snapPoint(position);

      setNodes((previous) =>
        previous.map((node) =>
          node.id === nodeId ? { ...node, position: snappedPosition } : node,
        ),
      );

      const updatedNode = nodesRef.current.find((node) => node.id === nodeId);

      if (!updatedNode) {
        return;
      }

      const finalNode = {
        ...updatedNode,
        position: snappedPosition,
      } as PlannerNode;

      if (finalNode.type === "decorativeNode") {
        trackDecorativeChange(finalNode);
      } else {
        trackSeatPlanChange(finalNode);
      }
    },
    [nodesRef, setNodes, trackDecorativeChange, trackSeatPlanChange],
  );

  const handleLineResizeStart = useCallback((nodeId: string, handle: LineResizeHandle) => {
    const node = nodesRef.current.find((item) => item.id === nodeId);

    if (!node || node.type !== "decorativeNode") {
      return;
    }

    const stagePointer = stageRef.current?.getPointerPosition();

    if (!stagePointer) {
      return;
    }

    const point = {
      x: (stagePointer.x - viewportRef.current.x) / viewportRef.current.zoom,
      y: (stagePointer.y - viewportRef.current.y) / viewportRef.current.zoom,
    };

    setLineResizeState({
      nodeId,
      handle,
      orientation:
        node.data.category === "line-horizontal" ? "horizontal" : "vertical",
      startPointer: point,
      startNodePosition: node.position,
      startWidth: node.data.width,
      startHeight: node.data.height,
    });
  }, [nodesRef, setLineResizeState, stageRef, viewportRef]);

  useEffect(() => {
    if (!lineResizeState) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const point = clientToWorld(event.clientX, event.clientY);

      if (!point) {
        return;
      }

      setNodes((previous) =>
        previous.map((node) => {
          if (node.id !== lineResizeState.nodeId || node.type !== "decorativeNode") {
            return node;
          }

          if (lineResizeState.orientation === "horizontal") {
            const deltaX = point.x - lineResizeState.startPointer.x;

            if (lineResizeState.handle === "start") {
              const newWidth = Math.max(20, lineResizeState.startWidth - deltaX);
              const xShift = lineResizeState.startWidth - newWidth;

              return {
                ...node,
                position: {
                  x: lineResizeState.startNodePosition.x + xShift,
                  y: node.position.y,
                },
                data: {
                  ...node.data,
                  width: newWidth,
                },
                style: {
                  width: `${newWidth}px`,
                  height: `${node.data.height}px`,
                },
              };
            }

            const newWidth = Math.max(20, lineResizeState.startWidth + deltaX);
            return {
              ...node,
              data: {
                ...node.data,
                width: newWidth,
              },
              style: {
                width: `${newWidth}px`,
                height: `${node.data.height}px`,
              },
            };
          }

          const deltaY = point.y - lineResizeState.startPointer.y;

          if (lineResizeState.handle === "start") {
            const newHeight = Math.max(20, lineResizeState.startHeight - deltaY);
            const yShift = lineResizeState.startHeight - newHeight;

            return {
              ...node,
              position: {
                x: node.position.x,
                y: lineResizeState.startNodePosition.y + yShift,
              },
              data: {
                ...node.data,
                height: newHeight,
              },
              style: {
                width: `${node.data.width}px`,
                height: `${newHeight}px`,
              },
            };
          }

          const newHeight = Math.max(20, lineResizeState.startHeight + deltaY);
          return {
            ...node,
            data: {
              ...node.data,
              height: newHeight,
            },
            style: {
              width: `${node.data.width}px`,
              height: `${newHeight}px`,
            },
          };
        }),
      );
    };

    const handleMouseUp = () => {
      const node = nodesRef.current.find((item) => item.id === lineResizeState.nodeId);

      if (node && node.type === "decorativeNode") {
        trackDecorativeChange(node);
      }

      setLineResizeState(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    clientToWorld,
    lineResizeState,
    nodesRef,
    setLineResizeState,
    setNodes,
    trackDecorativeChange,
  ]);

  const handleGuestHandleDown = useCallback(
    (
      event: Konva.KonvaEventObject<MouseEvent>,
      guestId: string,
      guestName: string,
      seatId: string,
      nodeId: string,
    ) => {
      event.cancelBubble = true;

      setGuestDragState({
        guestId,
        guestName,
        fromNodeId: nodeId,
        fromSeatId: seatId,
        clientX: event.evt.clientX,
        clientY: event.evt.clientY,
      });
    },
    [setGuestDragState],
  );

  useEffect(() => {
    if (!guestDragState) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      setGuestDragState((previous) =>
        previous
          ? {
              ...previous,
              clientX: event.clientX,
              clientY: event.clientY,
            }
          : previous,
      );
    };

    const handleMouseUp = (event: MouseEvent) => {
      const worldPoint = clientToWorld(event.clientX, event.clientY);

      if (worldPoint) {
        const target = findSeatTarget(worldPoint);

        if (target) {
          assignGuestToSeat({
            guestId: guestDragState.guestId,
            guestName: guestDragState.guestName,
            targetNodeId: target.nodeId,
            targetSeatId: target.seatId,
            fromNodeId: guestDragState.fromNodeId,
          });
        }
      }

      setGuestDragState(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    assignGuestToSeat,
    clientToWorld,
    findSeatTarget,
    guestDragState,
    setGuestDragState,
  ]);

  const handleRemoveGuest = useCallback(
    (guestId: string) => {
      const nextNodes = nodesRef.current.map((node) => {
        if (node.type === "decorativeNode") {
          return node;
        }

        const existingSeats = getSeatingNodeSeats(node);
        const updatedSeats = existingSeats.map((seat) =>
          seat.occupiedBy === guestId
            ? { ...seat, occupiedBy: null, occupiedByName: null }
            : seat,
        );

        const hasChanges = existingSeats.some(
          (seat, index) => seat.occupiedBy !== updatedSeats[index].occupiedBy,
        );

        if (!hasChanges) {
          return node;
        }

        const updatedNode = updateSeatingNodeSeats(node, updatedSeats);
        trackSeatPlanChange(updatedNode);
        return updatedNode;
      });

      setNodes(nextNodes);
      setGuests((previous) => previous.filter((guest) => guest._id !== guestId));
      clearTrackedGuest(guestId);
      deleteGuestMutation(guestId);
    },
    [
      clearTrackedGuest,
      deleteGuestMutation,
      nodesRef,
      setGuests,
      setNodes,
      trackSeatPlanChange,
    ],
  );

  const handleAddTableClick = useCallback((type: TableType) => {
    setNewTableType(type);
    setNewTableNumSeats(
      type === "circular-single-seat" ? 1 : type === "circular" ? 10 : 8,
    );
    setNewTableLabel("");
    setMeasurementType("");
    setTableWidthInput(0);
    setTableHeightInput(0);
    setIsAddTableDialogOpen(true);
  }, [
    setIsAddTableDialogOpen,
    setMeasurementType,
    setNewTableLabel,
    setNewTableNumSeats,
    setNewTableType,
    setTableHeightInput,
    setTableWidthInput,
  ]);

  const addDecorativeNodeAtPoint = useCallback(
    ({
      point,
      label,
      width,
      height,
      category,
    }: {
      point: Point;
      label: string;
      width: number;
      height: number;
      category: string;
    }) => {
      const node: DecorativePlannerNode = {
        id: uuidv4(),
        type: "decorativeNode",
        event_id: eventId,
        position: snapPoint(point),
        rotation: 0,
        data: {
          event_id: eventId,
          label,
          imageUrl: "",
          width,
          height,
          category,
        },
        style: {
          width: `${width}px`,
          height: `${height}px`,
        },
      };

      setNodes((previous) => [...previous, node]);
      trackDecorativeChange(node);
      createDecorativeNode(serializeDecorativeNode(node));
      zoomToNode(node.position);
    },
    [createDecorativeNode, eventId, setNodes, trackDecorativeChange, zoomToNode],
  );

  const handleConfirmAddTable = useCallback(() => {
    if (!newTableType || !newTableLabel.trim()) {
      toast.error("Please provide a name.");
      return;
    }

    if (newTableType === "line-horizontal" || newTableType === "line-vertical") {
      const thickness = tableWidthInput || 5;
      const length = tableHeightInput || 100;

      const width = newTableType === "line-horizontal" ? length : thickness;
      const height = newTableType === "line-vertical" ? length : thickness;
      const point = {
        x: Math.random() * Math.max(20, venueWidthPx - width - 20) + 20,
        y: Math.random() * Math.max(20, venueHeightPx - height - 20) + 20,
      };

      addDecorativeNodeAtPoint({
        point,
        label: newTableLabel,
        width,
        height,
        category: newTableType,
      });

      setIsAddTableDialogOpen(false);
      toast.success(`${newTableLabel} line added.`);
      return;
    }

    if (newTableType === "chair-row" || newTableType === "chair-column") {
      const chairs = Array.from({ length: newTableNumSeats }, () => ({
        id: uuidv4(),
        occupiedBy: null,
        occupiedByName: null,
      }));

      const dimensions = calculateChairNodeDimensions(newTableType, newTableNumSeats);
      const point = {
        x: Math.random() * Math.max(20, venueWidthPx - dimensions.width - 20) + 20,
        y: Math.random() * Math.max(20, venueHeightPx - dimensions.height - 20) + 20,
      };

      const node: ChairPlannerNode = {
        id: uuidv4(),
        type: "chairNode",
        event_id: eventId,
        position: snapPoint(point),
        rotation: 0,
        data: {
          event_id: eventId,
          label: newTableLabel,
          type: newTableType,
          chairs,
          width: dimensions.width,
          height: dimensions.height,
          numChairs: newTableNumSeats,
        },
        style: {
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        },
      };

      setNodes((previous) => [...previous, node]);
      trackSeatPlanChange(node);
      createSeatPlanNode(serializeSeatPlanNode(node));
      zoomToNode(node.position);
      setIsAddTableDialogOpen(false);
      toast.success(`${newTableLabel} added.`);
      return;
    }

    const seats = Array.from({ length: newTableNumSeats }, () => ({
      id: uuidv4(),
      occupiedBy: null,
      occupiedByName: null,
    }));

    const dimensions = calculateTableDimensions(newTableType, newTableNumSeats);
    const point = {
      x: Math.random() * Math.max(20, venueWidthPx - dimensions.width - 20) + 20,
      y: Math.random() * Math.max(20, venueHeightPx - dimensions.height - 20) + 20,
    };

    const node: TablePlannerNode = {
      id: uuidv4(),
      type: "tableNode",
      event_id: eventId,
      position: snapPoint(point),
      rotation: 0,
      data: {
        event_id: eventId,
        label: newTableLabel,
        type: newTableType,
        seats,
        width: dimensions.width,
        height: dimensions.height,
        numSeats: newTableNumSeats,
        measurementType,
        widthTable: tableWidthInput,
        heightTable: tableHeightInput,
      },
      style: {
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      },
    };

    setNodes((previous) => [...previous, node]);
    trackSeatPlanChange(node);
    createSeatPlanNode(serializeSeatPlanNode(node));
    zoomToNode(node.position);
    setIsAddTableDialogOpen(false);
    toast.success(`Table "${newTableLabel}" added.`);
  }, [
    addDecorativeNodeAtPoint,
    createSeatPlanNode,
    eventId,
    measurementType,
    newTableLabel,
    newTableNumSeats,
    newTableType,
    setIsAddTableDialogOpen,
    setNodes,
    tableHeightInput,
    tableWidthInput,
    trackSeatPlanChange,
    venueHeightPx,
    venueWidthPx,
    zoomToNode,
  ]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const worldPoint = clientToWorld(event.clientX, event.clientY);

      if (!worldPoint) {
        return;
      }

      const decorativeItemId = event.dataTransfer.getData("decorativeItemId");

      if (decorativeItemId) {
        const decorativeLabel = event.dataTransfer.getData("decorativeItemLabel");
        const decorativeWidth = parseInt(
          event.dataTransfer.getData("decorativeItemWidth"),
          10,
        );
        const decorativeHeight = parseInt(
          event.dataTransfer.getData("decorativeItemHeight"),
          10,
        );

        addDecorativeNodeAtPoint({
          point: worldPoint,
          label: decorativeLabel,
          width: decorativeWidth,
          height: decorativeHeight,
          category: decorativeItemId,
        });
        return;
      }

      const guestId = event.dataTransfer.getData("guestId");
      const guestName = event.dataTransfer.getData("guestName");

      if (!guestId || !guestName) {
        return;
      }

      const target = findSeatTarget(worldPoint);

      if (!target) {
        toast.error("Drop the guest on a seat.");
        return;
      }

      assignGuestToSeat({
        guestId,
        guestName,
        targetNodeId: target.nodeId,
        targetSeatId: target.seatId,
        fromNodeId: event.dataTransfer.getData("fromTableId") || undefined,
      });
    },
    [addDecorativeNodeAtPoint, assignGuestToSeat, clientToWorld, findSeatTarget],
  );

  return {
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
  };
}
