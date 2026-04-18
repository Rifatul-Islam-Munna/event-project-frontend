"use client";

import type { ReactNode } from "react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  Minus,
  Search,
  SeparatorVertical,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import type { Guest } from "@/@types/events-details";
import { GetGuestType } from "@/actions/vendor-category-actions";
import AddUser from "@/app/dashboard/AddUser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  image: string;
}> = [
  {
    type: "rectangular",
    label: "Rectangular",
    image: RT.src,
  },
  {
    type: "square",
    label: "Square",
    image: SQ.src,
  },
  {
    type: "circular",
    label: "Round",
    image: CQ.src,
  },
  {
    type: "rectangular-one-sided",
    label: "Head Table",
    image: OC.src,
  },
];

const INITIAL_VISIBLE_GUESTS = 10;
const MOTION_CLASS =
  "transition-all duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]";

function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <section className="border-b border-slate-900/6 pb-4 last:border-b-0 last:pb-0">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-slate-500">
            {title}
          </h2>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 ${MOTION_CLASS}`}
              aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
            >
              <ChevronDown
                className={`h-4 w-4 ${MOTION_CLASS} ${isOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-3 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          {children}
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

function TableTypeCard({
  label,
  image,
  onAdd,
}: {
  label: string;
  image: string;
  onAdd: () => void;
}) {
  return (
    <div
      className={`group relative rounded-xl p-2 text-center hover:bg-slate-100/70 ${MOTION_CLASS}`}
    >
      <button
        type="button"
        onClick={onAdd}
        className="flex w-full flex-col items-center gap-2"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100/80 group-hover:bg-emerald-50/70">
          <Image src={image} alt={label} fill className="object-contain p-1.5" />
        </span>
        <span className="text-[11px] font-medium text-slate-700">{label}</span>
      </button>

      <Button
        type="button"
        variant="ghost"
        className={`absolute right-1 top-1 h-6 rounded-md border border-slate-900/10 bg-transparent px-1.5 text-[12px] text-slate-600 opacity-0 hover:bg-white group-hover:opacity-100 ${MOTION_CLASS}`}
        onClick={onAdd}
      >
        Add
      </Button>
    </div>
  );
}

function QuickItemButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12px] font-medium text-slate-700 hover:bg-slate-100/80 ${MOTION_CLASS}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

function GuestRow({
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
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`group flex h-11 cursor-grab items-center gap-2 rounded-xl border border-transparent px-1.5 active:cursor-grabbing hover:bg-slate-50 ${MOTION_CLASS}`}
      draggable
      onDragStart={(event) => onDragStart(event, guest._id!, guest.name)}
    >
      <Avatar className="h-8 w-8 border border-slate-200 bg-white">
        <AvatarFallback className="bg-slate-100 text-[11px] font-semibold text-slate-700">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-medium text-slate-900">
            {guest.name}
          </p>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        </div>
        <p className="truncate text-[11px] text-slate-500">
          Drag to any open seat
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`h-7 w-7 shrink-0 rounded-full text-slate-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 ${MOTION_CLASS}`}
        onClick={(event) => {
          event.stopPropagation();
          onRemoveGuest(guest._id ?? "");
        }}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
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
  const params = useParams<{ id: string }>();
  const eventId = params.id;

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

  const handleQuickAdd = (type: TableType) => {
    onAddTableClick(type);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleDragStart = (
    event: React.DragEvent,
    guestId: string,
    guestName: string,
  ) => {
    event.dataTransfer.setData("guestId", guestId);
    event.dataTransfer.setData("guestName", guestName);
    event.dataTransfer.effectAllowed = "move";
  };

  const body = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="border-b border-slate-900/8 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Planner</p>
            <p className="text-[12px] text-slate-500">
              Tables, seating, decor, and guest placement
            </p>
          </div>

          {isMobile ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 ${MOTION_CLASS}`}
              onClick={() => setShowSidebar(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <div className="inline-flex h-8 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-[12px] font-medium text-slate-700">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span>{guests.length} guests</span>
          </div>
          <div className="inline-flex h-8 items-center gap-1.5 rounded-full bg-emerald-50 px-3 text-[12px] font-medium text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{unassignedGuests.length} unassigned</span>
          </div>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 px-4 py-4 pb-8">
          <SidebarSection title="Tables">
            <div className="grid grid-cols-2 gap-2">
              {TABLE_BUTTONS.map((item) => (
                <TableTypeCard
                  key={item.type}
                  label={item.label}
                  image={item.image}
                  onAdd={() => handleQuickAdd(item.type)}
                />
              ))}
            </div>
          </SidebarSection>

          <SidebarSection title="Seating and Dividers" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-2">
              <QuickItemButton
                icon={<ArrowRight className="h-4 w-4" />}
                label="Chair Row"
                onClick={() => handleQuickAdd("chair-row")}
              />
              <QuickItemButton
                icon={<ArrowDown className="h-4 w-4" />}
                label="Chair Column"
                onClick={() => handleQuickAdd("chair-column")}
              />
              <QuickItemButton
                icon={<Minus className="h-4 w-4" />}
                label="Horizontal Wall"
                onClick={() => handleQuickAdd("line-horizontal")}
              />
              <QuickItemButton
                icon={<SeparatorVertical className="h-4 w-4" />}
                label="Vertical Wall"
                onClick={() => handleQuickAdd("line-vertical")}
              />
            </div>
          </SidebarSection>

          <SidebarSection title="Decor and Templates" defaultOpen={false}>
            <div className="rounded-xl border border-slate-900/8 p-3">
              <DecorativeDrawer
                onAddDecorativeItem={() => {
                  if (isMobile) {
                    setShowSidebar(false);
                  }
                }}
              />
            </div>
            <div className="rounded-xl border border-slate-900/8 p-3">
              <ExtrasComponent />
            </div>
          </SidebarSection>

          <SidebarSection title="Unassigned Guests">
            <div className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search guests"
                  value={searchUser}
                  onChange={(event) => setSearchUser(event.target.value)}
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-[13px] focus-visible:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-[minmax(0,1fr),auto] gap-2">
                <Select
                  value={typeOfUser ?? "all"}
                  onValueChange={(value) =>
                    setTypeOfUser(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50 text-[13px]">
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
                <AddUser />
              </div>

              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2 text-[12px] text-slate-500">
                Drag a guest onto any open seat to assign them.
              </div>

              <div className="flex items-center justify-between text-[12px] text-slate-500">
                <span>
                  Showing {visibleGuests.length} of {filteredGuests.length}
                </span>
                <span>{unassignedGuests.length} total unassigned</span>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {filteredGuests.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm font-medium text-slate-900">
                      {searchUser ? "No matching guests" : "All guests assigned"}
                    </p>
                    <p className="mt-1 text-[12px] text-slate-500">
                      {searchUser
                        ? "Try another name, email, or type."
                        : "New guests will appear here automatically."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {visibleGuests.map((guest) => (
                      <GuestRow
                        key={guest._id}
                        guest={guest}
                        onDragStart={handleDragStart}
                        onRemoveGuest={onRemoveGuest}
                      />
                    ))}
                  </div>
                )}
              </div>

              {hasMoreGuests ? (
                <Button
                  type="button"
                  variant="outline"
                  className={`h-9 w-full rounded-xl border-slate-200 text-[13px] text-slate-700 hover:bg-slate-50 ${MOTION_CLASS}`}
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
              Add tables, decor, and guests to the seating planner.
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
    <aside className="hidden h-[100dvh] min-h-0 w-full max-w-[320px] shrink-0 overflow-hidden border-r border-slate-900/8 bg-white md:flex">
      <div className="min-h-0 w-full">{body}</div>
    </aside>
  );
}
