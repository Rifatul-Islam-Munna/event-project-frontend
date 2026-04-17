"use client";

import type React from "react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowRight, ChevronDown, LayoutGrid, Minus, Search, SeparatorVertical, Sparkles, Trash2, User, Users, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Guest } from "@/@types/events-details";
import { GetGuestType } from "@/actions/vendor-category-actions";
import AddUser from "@/app/dashboard/AddUser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import OC from "@/images/sideicons/Rectangular-one-sided.png";
import CQ from "@/images/sideicons/circletable.png";
import RT from "@/images/sideicons/RectangularTable.png";
import SQ from "@/images/sideicons/squre.png";
import { ExtrasComponent } from "./SideBarImage";
import { DecorativeDrawer } from "./decorative-node/decorative-sidebar";
import type { TableType } from "./planner-types";

interface SidebarProps {
  onAddTableClick: (type: TableType) => void;
  guests: Guest[];
  onRemoveGuest: (guestId: string) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

const TABLE_BUTTONS: Array<{
  type: Extract<
    TableType,
    "rectangular" | "square" | "circular" | "rectangular-one-sided"
  >;
  label: string;
  description: string;
  image: string;
}> = [
  {
    type: "rectangular",
    label: "Rectangular",
    description: "Classic long table",
    image: RT.src,
  },
  {
    type: "square",
    label: "Square",
    description: "Balanced group seating",
    image: SQ.src,
  },
  {
    type: "circular",
    label: "Round",
    description: "Conversation-friendly",
    image: CQ.src,
  },
  {
    type: "rectangular-one-sided",
    label: "Head Table",
    description: "One-sided focal table",
    image: OC.src,
  },
];

const INITIAL_VISIBLE_GUESTS = 10;

function SidebarSection({
  title,
  description,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-3.5 shadow-sm">
        <div className="mb-2.5 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          {children}
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

function GuestCard({
  guest,
  onDragStart,
  onRemoveGuest,
}: {
  guest: Guest;
  onDragStart: (event: React.DragEvent, guestId: string, guestName: string) => void;
  onRemoveGuest: (guestId: string) => void;
}) {
  const initials = guest.name
    .split(" ")
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const guestMeta: string[] = [];

  if (guest.type) {
    guestMeta.push(guest.type);
  }

  if (guest.adults || guest.children) {
    guestMeta.push(`${guest.adults ?? 0}A · ${guest.children ?? 0}C`);
  }

  const displayGuestMeta = guestMeta.map((item) => {
    const guestCountsMatch = item.match(/^(\d+)A.*?(\d+)C$/);

    if (!guestCountsMatch) {
      return item;
    }

    return `${guestCountsMatch[1]} adults / ${guestCountsMatch[2]} children`;
  });
  const compactMeta = displayGuestMeta
    .map((item) =>
      item
        .replace(/ adults \/ /g, "A/")
        .replace(/ children/g, "C"),
    )
    .join(" | ");

  return (
    <Card
      className="flex cursor-grab items-center gap-1.5 rounded-md border border-slate-200 bg-white px-1.5 py-1 shadow-none transition-all hover:border-emerald-300 hover:bg-emerald-50/60 active:cursor-grabbing"
      draggable
      onDragStart={(event) => onDragStart(event, guest._id!, guest.name)}
    >
      <Avatar className="h-6 w-6">
        <AvatarFallback className="bg-emerald-100 text-[8px] font-semibold text-emerald-700">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex items-center gap-1 overflow-hidden">
          <p className="truncate text-[11px] font-medium leading-none text-slate-900">
            {guest.name}
          </p>
          {compactMeta ? (
            <p className="truncate text-[9px] leading-none text-slate-500">
              {compactMeta}
            </p>
          ) : null}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 shrink-0 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"
        onClick={(event) => {
          event.stopPropagation();
          onRemoveGuest(guest._id ?? "");
        }}
      >
        <Trash2 className="h-2.5 w-2.5" />
      </Button>
    </Card>
  );
}

export function Sidebar({
  onAddTableClick,
  guests = [],
  onRemoveGuest,
  showSidebar,
  setShowSidebar,
}: SidebarProps) {
  const isMobile = useIsMobile();
  const [searchUser, setSearchUser] = useState("");
  const [typeOfUser, setTypeOfUser] = useState<string | null>(null);
  const [visibleGuestCount, setVisibleGuestCount] = useState(
    INITIAL_VISIBLE_GUESTS,
  );
  const deferredSearchUser = useDeferredValue(searchUser);
  const pathname = usePathname();
  const eventId = pathname.split("/").pop() as string;

  const { data: userType } = useQuery({
    queryKey: ["get-all-user-Type", eventId],
    queryFn: () => GetGuestType(eventId),
    enabled: Boolean(eventId),
  });

  const unassignedGuests = useMemo(
    () => guests.filter((guest) => !guest.isAssigned),
    [guests],
  );

  const filteredGuests = useMemo(() => {
    const normalizedSearch = deferredSearchUser.trim().toLowerCase();

    return unassignedGuests.filter((guest) => {
      const matchesSearch =
        !normalizedSearch ||
        guest.name.toLowerCase().includes(normalizedSearch) ||
        (guest.email ?? "").toLowerCase().includes(normalizedSearch);
      const matchesType = typeOfUser ? guest.type === typeOfUser : true;

      return matchesSearch && matchesType;
    });
  }, [deferredSearchUser, typeOfUser, unassignedGuests]);

  useEffect(() => {
    setVisibleGuestCount(INITIAL_VISIBLE_GUESTS);
  }, [searchUser, typeOfUser]);

  const visibleGuests = filteredGuests.slice(0, visibleGuestCount);
  const hasMoreGuests = filteredGuests.length > visibleGuestCount;

  const handleDragStart = (
    event: React.DragEvent,
    guestId: string,
    guestName: string,
  ) => {
    event.dataTransfer.setData("guestId", guestId);
    event.dataTransfer.setData("guestName", guestName);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleQuickAdd = (type: TableType) => {
    onAddTableClick(type);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const body = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-b from-white via-white to-slate-50">
      <div className="border-b border-slate-200 px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Planner tools</p>
            <p className="text-[11px] text-slate-500">
              Tables, chairs, decor, and guest seating
            </p>
          </div>

          {isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-slate-500 hover:bg-white"
              onClick={() => setShowSidebar(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[11px] font-medium text-slate-700">
              {guests.length} guests
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
            <User className="h-3.5 w-3.5 text-emerald-700" />
            <span className="text-[11px] font-medium text-emerald-800">
              {unassignedGuests.length} unassigned
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 p-4 pb-8">
          <SidebarSection
            title="Tables"
            description="Choose the table style that fits the room."
            icon={<LayoutGrid className="h-5 w-5" />}
            defaultOpen
          >
            <div className="grid grid-cols-2 gap-3">
              {TABLE_BUTTONS.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleQuickAdd(item.type)}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-slate-50">
                      <Image
                        src={item.image}
                        alt={item.label}
                        fill
                        className="object-contain p-1.5"
                      />
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
                    >
                      Add
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection
            title="Seating and Dividers"
            description="Create rows, columns, and room boundaries."
            icon={<Sparkles className="h-5 w-5" />}
            defaultOpen={false}
          >
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-auto justify-start rounded-2xl border-slate-200 px-4 py-3 text-left hover:border-emerald-300 hover:bg-emerald-50"
                  onClick={() => handleQuickAdd("chair-row")}
                >
                  <ArrowRight className="mr-2 h-4 w-4 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium">Chair Row</span>
                    <span className="block text-xs text-slate-500">
                      Horizontal seating
                    </span>
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto justify-start rounded-2xl border-slate-200 px-4 py-3 text-left hover:border-emerald-300 hover:bg-emerald-50"
                  onClick={() => handleQuickAdd("chair-column")}
                >
                  <ArrowDown className="mr-2 h-4 w-4 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium">Chair Column</span>
                    <span className="block text-xs text-slate-500">
                      Vertical seating
                    </span>
                  </span>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-auto justify-start rounded-2xl border-slate-200 px-4 py-3 text-left hover:border-emerald-300 hover:bg-emerald-50"
                  onClick={() => handleQuickAdd("line-horizontal")}
                >
                  <Minus className="mr-2 h-4 w-4 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium">Horizontal Wall</span>
                    <span className="block text-xs text-slate-500">
                      Split wide spaces
                    </span>
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto justify-start rounded-2xl border-slate-200 px-4 py-3 text-left hover:border-emerald-300 hover:bg-emerald-50"
                  onClick={() => handleQuickAdd("line-vertical")}
                >
                  <SeparatorVertical className="mr-2 h-4 w-4 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium">Vertical Wall</span>
                    <span className="block text-xs text-slate-500">
                      Shape room flow
                    </span>
                  </span>
                </Button>
              </div>
            </div>
          </SidebarSection>

          <SidebarSection
            title="Decor and Templates"
            description="Drag decorative pieces or apply a reference layout."
            icon={<Sparkles className="h-5 w-5" />}
            defaultOpen={false}
          >
            <DecorativeDrawer
              onAddDecorativeItem={() => {
                if (isMobile) {
                  setShowSidebar(false);
                }
              }}
            />
            <div className="mt-3">
              <ExtrasComponent />
            </div>
          </SidebarSection>

          <SidebarSection
            title="Unassigned Guests"
            description="Search and drag guests directly onto seats."
            icon={<Users className="h-5 w-5" />}
            defaultOpen
          >
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr),auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search guests"
                    value={searchUser}
                    onChange={(event) => setSearchUser(event.target.value)}
                    className="rounded-2xl border-slate-200 pl-9 focus-visible:ring-emerald-500"
                  />
                </div>
                <AddUser />
              </div>

              <Select
                value={typeOfUser ?? "all"}
                onValueChange={(value) =>
                  setTypeOfUser(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-full rounded-2xl border-slate-200">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {userType?.data?.type?.map((type: string) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Drag a guest card onto any empty seat to assign them.
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {visibleGuests.length} of {filteredGuests.length}
                </span>
                {hasMoreGuests ? (
                  <span>{filteredGuests.length - visibleGuests.length} more</span>
                ) : null}
              </div>

              <div className="space-y-1">
                {filteredGuests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      {searchUser ? "No matching guests" : "All guests are seated"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {searchUser
                        ? "Try another name, email, or guest type."
                        : "Add more guests or free up seats to continue."}
                    </p>
                  </div>
                ) : (
                  visibleGuests.map((guest) => (
                    <GuestCard
                      key={guest._id}
                      guest={guest}
                      onDragStart={handleDragStart}
                      onRemoveGuest={onRemoveGuest}
                    />
                  ))
                )}
              </div>

              {hasMoreGuests ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-2xl border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
                  onClick={() =>
                    setVisibleGuestCount(
                      (previous) => previous + INITIAL_VISIBLE_GUESTS,
                    )
                  }
                >
                  Load More
                </Button>
              ) : null}
            </div>
          </SidebarSection>
        </div>
      </ScrollArea>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent
          side="left"
          className="h-[100dvh] w-[92vw] max-w-none overflow-hidden border-r-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Planner Sidebar</SheetTitle>
            <SheetDescription>
              Add tables, decor, and guests to the wedding planner.
            </SheetDescription>
          </SheetHeader>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  if (!showSidebar) {
    return null;
  }

  return (
    <aside className="hidden h-[100dvh] min-h-0 w-full max-w-[360px] shrink-0 overflow-hidden border-r border-slate-200 bg-white/90 md:flex">
      <div className="min-h-0 w-full">{body}</div>
    </aside>
  );
}
