"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  User,
  Square,
  Circle,
  X,
  Trash2,
  GripHorizontal,
  GripVertical,
} from "lucide-react"; // Removed Save, FolderOpen
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AddUser from "@/app/dashboard/AddUser";
import type { Guest } from "@/@types/events-details";
import type { TableType } from "./wedding-planner";
import { ExtrasComponent } from "./SideBarImage";
import { DecorativeDrawer } from "./decorative-node/decorative-sidebar";
import RT from "@/images/sideicons/RectangularTable.png";
import SQ from "@/images/sideicons/squre.png";
import CQ from "@/images/sideicons/circletable.png";
import OC from "@/images/sideicons/Rectangular-one-sided.png";
import ON from "@/images/sideicons/oneC.png";
import Image from "next/image";
import { useZoomResponive } from "@/zustan-fn/zoomResponive";
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
  const { imageUrl, setImageUrl, isEditMode } = useZoomResponive(
    (state) => state
  );
  useEffect(() => {
    setImageUrl("");
  }, []);
  const handleDragStart = (
    event: React.DragEvent,
    guestId: string,
    guestName: string
  ) => {
    event.dataTransfer.setData("guestId", guestId);
    event.dataTransfer.setData("guestName", guestName);
    event.dataTransfer.effectAllowed = "move";
  };

  const [seachUser, setSeachUser] = useState("");
  const getSeachUser = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(seachUser.toLowerCase()) ||
      guest.email.toLowerCase().includes(seachUser.toLowerCase())
  );

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-80 bg-white  md:bg-white/60 mt-11 md:mt-0 border-r p-4 flex flex-col h-full transition-transform duration-300 ease-in-out
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

      <div className="flex gap-1 mb-6 justify-between">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 p-0 shadow-none border border-gray-100 bg-transparent"
          onClick={() => onAddTableClick("rectangular")}
        >
          {/*    <div className="w-4 h-2 border border-cyan-500 rounded-sm" /> */}
          <div className="relative w-10 h-10">
            <Image
              width={100}
              height={100}
              alt="icons"
              src={RT.src}
              className="absolute inset-0 w-full h-full "
            />
            {/* <div className="absolute inset-0 bg-blue-500" /> */}
          </div>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 p-0 shadow-none border border-gray-100 bg-transparent"
          onClick={() => onAddTableClick("square")}
        >
          <div className="relative w-10 h-10">
            <Image
              width={100}
              height={100}
              alt="icons"
              src={SQ.src}
              className="absolute inset-0 w-full h-full "
            />
            {/* <div className="absolute inset-0 bg-blue-500" /> */}
          </div>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 p-0 shadow-none border border-gray-100 bg-transparent"
          onClick={() => onAddTableClick("circular")}
        >
          <div className="relative w-10 h-10">
            <Image
              width={100}
              height={100}
              alt="icons"
              src={CQ.src}
              className="absolute inset-0 w-full h-full "
            />
            {/* <div className="absolute inset-0 bg-blue-500" /> */}
          </div>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 p-0 shadow-none border border-gray-100 bg-transparent"
          onClick={() => onAddTableClick("rectangular-one-sided")}
        >
          <div className="relative w-10 h-10">
            <Image
              width={100}
              height={100}
              alt="icons"
              src={OC.src}
              className="absolute inset-0 w-full h-full "
            />
            {/* <div className="absolute inset-0 bg-blue-500" /> */}
          </div>
        </Button>
        {/*    <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 p-0 shadow-none border border-gray-100 bg-transparent"
          onClick={() => onAddTableClick("circular-single-seat")}
        >
          <div className="relative w-10 h-10">
            <Image
              width={100}
              height={100}
              alt="icons"
              src={ON.src}
              className="absolute inset-0 w-full h-full "
            />
          
          </div>
        </Button> */}
      </div>

      <h2 className="text-lg font-semibold mb-4">Add Chairs</h2>
      <div className="flex gap-2 mb-6">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onAddTableClick("chair-row")}
        >
          <GripHorizontal className="w-4 h-4 mr-2" />
          Row
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onAddTableClick("chair-column")}
        >
          <GripVertical className="w-4 h-4 mr-2" />
          Column
        </Button>
      </div>

      <DecorativeDrawer onAddDecorativeItem={() => setShowSidebar(false)} />
      <ExtrasComponent />
      <h2 className="text-lg font-semibold mb-4">Guests</h2>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search Guests"
          value={seachUser}
          onChange={(e) => setSeachUser(e.target.value)}
        />
        <AddUser />
      </div>
      <ScrollArea className="flex-grow pr-2">
        <div className="flex flex-col gap-2">
          {" "}
          {/* Changed to flex-col */}
          {getSeachUser?.filter((guest) => !guest.isAssigned).length === 0 && (
            <p className="text-sm text-gray-500">No unassigned guests.</p>
          )}
          {getSeachUser
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
