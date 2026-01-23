"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  User,
  X,
  Trash2,
  Minus,
  SeparatorVertical,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AddUser from "@/app/dashboard/AddUser";
import type { Guest } from "@/@types/events-details";
import type { TableType } from "./wedding-planner";
import { ExtrasComponent } from "./SideBarImage";

import RT from "@/images/sideicons/RectangularTable.png";
import SQ from "@/images/sideicons/squre.png";
import CQ from "@/images/sideicons/circletable.png";
import OC from "@/images/sideicons/Rectangular-one-sided.png";
import Image from "next/image";
import { useZoomResponive } from "@/zustan-fn/zoomResponive";
import { DecorativeDrawer } from "./decorative-node/decorative-sidebar";

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
    (state) => state,
  );

  useEffect(() => {
    setImageUrl("");
  }, []);

  const handleDragStart = (
    event: React.DragEvent,
    guestId: string,
    guestName: string,
    guest: Guest,
  ) => {
    event.dataTransfer.setData("guestId", guestId);
    event.dataTransfer.setData("guestName", guestName);
    event.dataTransfer.effectAllowed = "move";
  };

  const [seachUser, setSeachUser] = useState("");
  const getSeachUser = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(seachUser.toLowerCase()) ||
      guest.email.toLowerCase().includes(seachUser.toLowerCase()),
  );

  // Don't render at all when hidden
  if (!showSidebar) {
    return null;
  }

  return (
    <div className="fixed  max-w-sm inset-y-0 left-0 z-10  px-4 md:pr-3 bg-white/60 md:bg-white/60 mt-11 md:mt-0 border-r flex flex-col h-full transition-transform duration-300 ease-in-out md:relative translate-x-0 sidebar-container overflow-y-auto pb-8">
      {/* Close Button - Fixed at Top */}
      <div className="flex justify-end items-center p-4 pb-0 md:hidden flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSidebar(false)}
          className="hover:bg-lime-50 hover:text-lime-600"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close Sidebar</span>
        </Button>
      </div>

      {/* ENTIRE CONTENT SCROLLABLE */}

      <div className="space-y-6 py-4">
        {/* Add Tables */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Tables</h2>
          <div className="flex gap-1 justify-between">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 p-0 shadow-none border-none bg-transparent hover:border-lime-600 hover:bg-lime-50"
              onClick={() => onAddTableClick("rectangular")}
              title="Rectangular Table"
            >
              <div className="relative w-10 h-10">
                <Image
                  width={100}
                  height={100}
                  alt="Rectangular Table"
                  src={RT.src}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 p-0 shadow-none border-none bg-transparent hover:border-lime-600 hover:bg-lime-50"
              onClick={() => onAddTableClick("square")}
              title="Square Table"
            >
              <div className="relative w-10 h-10">
                <Image
                  width={100}
                  height={100}
                  alt="Square Table"
                  src={SQ.src}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 p-0 shadow-none border-none bg-transparent hover:border-lime-600 hover:bg-lime-50"
              onClick={() => onAddTableClick("circular")}
              title="Round Table"
            >
              <div className="relative w-10 h-10">
                <Image
                  width={100}
                  height={100}
                  alt="Round Table"
                  src={CQ.src}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 p-0 shadow-none border-none bg-transparent hover:border-lime-600 hover:bg-lime-50"
              onClick={() => onAddTableClick("rectangular-one-sided")}
              title="Head Table"
            >
              <div className="relative w-10 h-10">
                <Image
                  width={100}
                  height={100}
                  alt="Head Table"
                  src={OC.src}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Add Seating */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Seating</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-200 hover:border-lime-600 hover:bg-lime-50 hover:text-lime-700"
              onClick={() => onAddTableClick("chair-row")}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Row of Chairs
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-gray-200 hover:border-lime-600 hover:bg-lime-50 hover:text-lime-700"
              onClick={() => onAddTableClick("chair-column")}
            >
              <ArrowDown className="w-4 h-4 mr-2" />
              Column of Chairs
            </Button>
          </div>
        </div>

        {/* Add Room Dividers */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Room Dividers
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-200 hover:border-lime-600 hover:bg-lime-50 hover:text-lime-700"
              onClick={() => onAddTableClick("line-horizontal")}
            >
              <Minus className="w-4 h-4 mr-2" />
              Horizontal Wall
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-gray-200 hover:border-lime-600 hover:bg-lime-50 hover:text-lime-700"
              onClick={() => onAddTableClick("line-vertical")}
            >
              <SeparatorVertical className="w-4 h-4 mr-2" />
              Vertical Wall
            </Button>
          </div>
        </div>

        {/* Decorations */}
        <DecorativeDrawer onAddDecorativeItem={() => setShowSidebar(false)} />

        {/* Extras */}
        <ExtrasComponent />

        {/* Guests Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Unassigned Guests (
            {getSeachUser?.filter((guest) => !guest.isAssigned).length})
          </h2>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search guests..."
              value={seachUser}
              onChange={(e) => setSeachUser(e.target.value)}
              className="border-gray-200 focus:border-lime-600 focus:ring-lime-600"
            />
            <AddUser />
          </div>

          <div className="flex flex-col gap-2">
            {getSeachUser?.filter((guest) => !guest.isAssigned).length ===
              0 && (
              <p className="text-sm text-gray-500 py-4 text-center">
                {seachUser ? "No matching guests" : "All guests are seated!"}
              </p>
            )}
            {getSeachUser
              ?.filter((guest) => !guest.isAssigned)
              .map((guest) => (
                <Card
                  key={guest._id}
                  className="w-full grid grid-cols-3 justify-center items-center gap-2 shadow-none py-1 border border-gray-200 hover:border-lime-600 hover:bg-lime-50 cursor-grab active:cursor-grabbing transition-colors"
                  draggable={true}
                  onDragStart={(e) =>
                    handleDragStart(e, guest._id!, guest?.name, guest)
                  }
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-lime-100 text-lime-700 text-xs font-medium">
                      {guest?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-grow text-sm font-medium text-gray-900 truncate">
                    {guest?.name}
                    {(guest?.adults || guest?.children) && (
                      <span className="text-[10px] text-gray-500 ml-1">
                        {guest?.adults}A·{guest?.children}C
                      </span>
                    )}
                  </span>
                  <div className="flex justify-center items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-gray-500 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveGuest(guest?._id ?? "");
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Remove guest</span>
                    </Button>
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
