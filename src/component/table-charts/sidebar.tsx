import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TableType } from "../wedding-planner";
import { User, Square, Circle, X, Trash2, GripHorizontal } from "lucide-react"; // Removed Save, FolderOpen
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AddUser from "@/app/dashboard/AddUser";
import { useQuery } from "@tanstack/react-query";
import { getAllGuest } from "@/actions/fetch-action";
import { usePathname } from "next/navigation";
import { Guest } from "@/@types/events-details";

interface SidebarProps {
  onAddTableClick: (type: TableType) => void;
  guests: Guest[];
  onAddGuest: (name: string) => void;
  onRemoveGuest: (guestId: string) => void;

  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

export function Sidebar({
  onAddTableClick,
  guests = [],
  onAddGuest,
  onRemoveGuest,

  showSidebar,
  setShowSidebar,
}: SidebarProps) {
  const [newGuestName, setNewGuestName] = useState("");

  const handleDragStart = (
    event: React.DragEvent,
    guestId: string,
    guestName: string
  ) => {
    event.dataTransfer.setData("guestId", guestId);
    event.dataTransfer.setData("guestName", guestName);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-80 bg-gradient-to-r from-gray-50/30 to-gray-50 mt-11 md:mt-0 border-r p-4 flex flex-col h-full transition-transform duration-300 ease-in-out
               md:relative md:translate-x-0 ${
                 showSidebar ? "translate-x-0" : "-translate-x-full"
               } sidebar-container`} // Added sidebar-container for print styles
    >
      <div className="flex justify-end items-center mb-4 md:hidden">
        {/*         <h2 className="text-lg font-semibold">Menu</h2> */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSidebar(false)}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close Sidebar</span>
        </Button>
      </div>
      <h2 className="text-lg font-semibold mb-4">Add Table</h2>
      <div className="grid grid-cols-3 gap-2 mb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="flex flex-col h-20 shadow-none border border-gray-100"
                onClick={() => onAddTableClick("rectangular")}
              >
                <div className="w-12 h-6 border-2 border-gray-400 rounded-sm mb-1" />
                <span className="text-xs">Rectangular</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add a rectangular table</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="flex flex-col h-20 shadow-none border border-gray-100"
                onClick={() => onAddTableClick("square")}
              >
                <Square className="w-8 h-8 text-gray-400 mb-1" />
                <span className="text-xs">Square</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add a square table</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="flex flex-col h-20 shadow-none border border-gray-100"
                onClick={() => onAddTableClick("circular")}
              >
                <Circle className="w-8 h-8 text-gray-400 mb-1" />
                <span className="text-xs">Circular</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add a circular table</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="flex flex-col h-20 shadow-none border border-gray-100"
                onClick={() => onAddTableClick("rectangular-one-sided")}
              >
                <div className="w-12 h-6 border-2 border-gray-400 rounded-sm mb-1 relative">
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gray-400 opacity-20" />
                </div>
                <span className="text-xs">One-sided Rect.</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add a rectangular table with seats on one side</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="flex flex-col h-20 shadow-none border border-gray-100"
                onClick={() => onAddTableClick("circular-single-seat")}
              >
                <Circle className="w-8 h-8 text-gray-400 mb-1 relative">
                  <User className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-600" />
                </Circle>
                <span className="text-xs">Single Seat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add a circular table with a single seat in the middle</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <h2 className="text-lg font-semibold mb-4">Guests</h2>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Add new guest"
          value={newGuestName}
          onChange={(e) => setNewGuestName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              onAddGuest(newGuestName);
              setNewGuestName("");
            }
          }}
        />
        <AddUser />
      </div>
      <ScrollArea className="flex-grow pr-2">
        <div className="flex flex-col gap-2">
          {" "}
          {/* Changed to flex-col */}
          {guests?.filter((guest) => !guest.isAssigned).length === 0 && (
            <p className="text-sm text-gray-500">No unassigned guests.</p>
          )}
          {guests
            ?.filter((guest) => !guest.isAssigned)
            .map((guest) => (
              <Card
                key={guest._id}
                className={` w-full grid grid-cols-3 justify-center items-center gap-2 shadow-none py-1 border border-gray-100 cursor-grab`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, guest._id!, guest?.name)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gray-200 text-gray-600">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="flex-grow text-sm font-medium">
                  {guest?.name}
                </span>
                <div className="flex justify-center items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-gray-500 hover:text-red-500"
                    onClick={() => onRemoveGuest(guest?._id ?? "")}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Remove guest</span>
                  </Button>
                  <GripHorizontal className=" w-4 h-4" />
                </div>
              </Card>
            ))}
        </div>
      </ScrollArea>
      <div className="mt-auto pt-4 border-t border-gray-200 flex gap-2">
        {/* Save button moved to main WeddingPlanner component */}
        {/* Load button removed as per request */}
      </div>
    </div>
  );
}
