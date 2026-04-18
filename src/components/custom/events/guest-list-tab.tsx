"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Edit,
  Info,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Send,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  XCircle,
} from "lucide-react";
import { Guest } from "@/@types/events-details";
import { User } from "@/@types/user-types";
import { getUserInfo } from "@/actions/auth";
import {
  deleteGuest,
  DownloadGuestPdf,
  getAllGuest,
} from "@/actions/fetch-action";
import { GetGuestType } from "@/actions/vendor-category-actions";
import { CreateGuestForm } from "./create-guest-form";
import { EditGuestForm } from "./edit-guest-form";
import { UploadCsvForm } from "./upload-csv-form";
import { AddUserTypeDialog } from "./AddUserTypeDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const GUESTS_PER_PAGE = 10;

const getGuestInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

// ─── Metric Card ─────────────────────────────────────────────────────────────
function GuestMetricCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-zinc-900 tabular-nums">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center",
            accent ? "bg-lime-50 text-lime-600" : "bg-zinc-100 text-zinc-400",
          )}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

// ─── Badges ──────────────────────────────────────────────────────────────────
function SeatingStatusBadge({ guest }: { guest: Guest }) {
  return guest.isAssigned ? (
    <span className="inline-flex items-center gap-1.5 border border-lime-200 bg-lime-50 px-2 py-0.5 text-[11px] font-medium text-lime-700">
      <CheckCircle className="h-3 w-3" />
      Seated {guest.seat_number ? `#${guest.seat_number}` : ""}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
      <XCircle className="h-3 w-3" />
      Not Seated
    </span>
  );
}

function MessageStatusBadge({ guest }: { guest: Guest }) {
  return guest.isMessageSend ? (
    <span className="inline-flex items-center gap-1.5 border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
      <Send className="h-3 w-3" />
      Sent
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
      <XCircle className="h-3 w-3" />
      Pending
    </span>
  );
}

function GuestTypeBadge({ type }: { type?: string }) {
  return (
    <span className="inline-flex items-center border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
      {type?.trim() || "N/A"}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function GuestListTab() {
  const [isCreateGuestModalOpen, setIsCreateGuestModalOpen] = useState(false);
  const [isEditGuestModalOpen, setIsEditGuestModalOpen] = useState(false);
  const [isViewGuestModalOpen, setIsViewGuestModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [typeOfUser, setTypeOfUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const params = useParams<{ id: string }>();
  const eventId = params.id;
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const info = await getUserInfo();
      setUser(info);
    };
    loadUser();
  }, []);

  const handleEditClick = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsEditGuestModalOpen(true);
  };

  const handleViewDetailsClick = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsViewGuestModalOpen(true);
  };

  const handleDeleteClick = (guest: Guest) => {
    setGuestToDelete(guest);
    setIsDeleteConfirmModalOpen(true);
  };

  const { mutate: downloadGuestCsv, isPending: isDownloadPending } =
    useMutation({
      mutationKey: ["downloadImage"],
      mutationFn: () => DownloadGuestPdf(eventId),
      onSuccess: (result) => {
        if (result.error || !result.data) {
          toast.error("Failed to download CSV");
          return;
        }
        const blob = new Blob([String(result.data)], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "seating.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("CSV downloaded successfully");
      },
    });

  const { mutate: deleteGuestMutation, isPending: isDeletePending } =
    useMutation({
      mutationKey: ["deleteGuest"],
      mutationFn: (id: string) => deleteGuest(id),
      onSuccess: (result) => {
        if (result?.error) {
          toast.error(result.error.message);
          return;
        }
        queryClient.refetchQueries({
          queryKey: ["get-all-guest"],
          exact: false,
        });
        toast.success("Guest removed successfully");
        setIsDeleteConfirmModalOpen(false);
        setGuestToDelete(null);
      },
      onError: (error) => {
        toast.error(error?.message);
      },
    });

  const confirmDelete = () => {
    if (!guestToDelete?._id) {
      toast.error("Guest not found");
      return;
    }
    deleteGuestMutation(guestToDelete._id);
  };

  const { data, isPending } = useQuery({
    queryKey: ["get-all-guest", typeOfUser],
    queryFn: () => getAllGuest(eventId, typeOfUser),
  });

  const { data: userType } = useQuery({
    queryKey: ["get-all-user-Type"],
    queryFn: () => GetGuestType(eventId),
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeOfUser]);

  const filteredGuests =
    data?.data?.filter(
      (guest) =>
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guest.email ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const totalGuests = data?.data?.length ?? 0;
  const seatedGuestsCount = data?.data?.filter((g) => g.isAssigned).length ?? 0;
  const unseatedGuestsCount = Math.max(0, totalGuests - seatedGuestsCount);
  const messageSentGuestsCount =
    data?.data?.filter((g) => g.isMessageSend).length ?? 0;
  const hasGuests = totalGuests > 0;
  const totalFilteredGuests = filteredGuests.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalFilteredGuests / GUESTS_PER_PAGE),
  );
  const pageStartIndex = (currentPage - 1) * GUESTS_PER_PAGE;
  const paginatedGuests = filteredGuests.slice(
    pageStartIndex,
    pageStartIndex + GUESTS_PER_PAGE,
  );
  const visibleGuestStart = totalFilteredGuests === 0 ? 0 : pageStartIndex + 1;
  const visibleGuestEnd = Math.min(
    pageStartIndex + GUESTS_PER_PAGE,
    totalFilteredGuests,
  );
  const hasMultiplePages = totalFilteredGuests > GUESTS_PER_PAGE;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4 p-3 md:p-4">
      {/* ── Header section ── */}
      <section className="border border-zinc-200 bg-white">
        {/* Lime top accent */}
        <div className="h-[3px] w-full bg-lime-500" />

        <div className="p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Guest Management
              </p>
              <h1 className="mt-1.5 text-xl font-bold text-zinc-900">
                Guest List
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Manage guests, seating assignments and message delivery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex h-8 items-center gap-1.5 border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-600">
                <Users className="h-3.5 w-3.5 text-zinc-400" />
                {totalGuests} total
              </div>
              <div className="inline-flex h-8 items-center gap-1.5 border border-lime-200 bg-lime-50 px-3 text-xs font-medium text-lime-700">
                <UserCheck className="h-3.5 w-3.5" />
                {seatedGuestsCount} seated
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="mt-5 grid gap-px bg-zinc-200 border border-zinc-200 md:grid-cols-2 xl:grid-cols-4">
            <GuestMetricCard
              icon={<Users className="h-4.5 w-4.5" />}
              label="Total Guests"
              value={String(totalGuests)}
            />
            <GuestMetricCard
              icon={<UserCheck className="h-4.5 w-4.5" />}
              label="Seated"
              value={String(seatedGuestsCount)}
              accent
            />
            <GuestMetricCard
              icon={<UserX className="h-4.5 w-4.5" />}
              label="Waiting for Seat"
              value={String(unseatedGuestsCount)}
            />
            <GuestMetricCard
              icon={<Send className="h-4.5 w-4.5" />}
              label="Messages Sent"
              value={String(messageSentGuestsCount)}
            />
          </div>
        </div>
      </section>

      {/* ── Table section ── */}
      <section className="border border-zinc-200 bg-white">
        {/* Toolbar */}
        <div className="border-b border-zinc-100 px-5 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Guest Directory
              </h2>
              <p className="mt-0.5 text-xs text-zinc-400">
                {hasGuests
                  ? `${totalFilteredGuests} result${totalFilteredGuests === 1 ? "" : "s"} of ${totalGuests} guest${totalGuests === 1 ? "" : "s"}`
                  : "No guests yet. Add your first guest to get started."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search name or email…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-60 rounded-none border-zinc-200 bg-zinc-50 pl-9 text-xs focus-visible:ring-lime-500"
                />
              </div>

              {/* Type filter */}
              <Select
                value={typeOfUser ?? "all"}
                onValueChange={(value) =>
                  setTypeOfUser(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="h-8 w-36 rounded-none border-zinc-200 bg-zinc-50 text-xs">
                  <SelectValue placeholder="All Types" />
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

              {/* Add Guest */}
              <Dialog
                open={isCreateGuestModalOpen}
                onOpenChange={setIsCreateGuestModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 rounded-none bg-lime-600 px-3 text-xs font-semibold text-white hover:bg-lime-700 gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Guest
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-none sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle className="text-base font-semibold text-zinc-900">
                      Add New Guest
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-500">
                      Add guests individually or upload a CSV for bulk import.
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="manual" className="mt-2 w-full">
                    <TabsList className="flex h-auto w-full justify-start gap-0 rounded-none border-b border-zinc-200 bg-white p-0">
                      <TabsTrigger
                        value="manual"
                        className="flex-1 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-xs text-zinc-500 hover:text-zinc-800 data-[state=active]:border-lime-600 data-[state=active]:text-lime-600"
                      >
                        <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                        Manual Entry
                      </TabsTrigger>
                      {user?.plan?.permissions?.includes("csv.import") && (
                        <TabsTrigger
                          value="csv"
                          className="flex-1 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-xs text-zinc-500 hover:text-zinc-800 data-[state=active]:border-lime-600 data-[state=active]:text-lime-600"
                        >
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                          Upload CSV
                        </TabsTrigger>
                      )}
                    </TabsList>
                    <TabsContent value="manual" className="mt-4">
                      <CreateGuestForm
                        onClose={() => setIsCreateGuestModalOpen(false)}
                        eventId={eventId}
                      />
                    </TabsContent>
                    <TabsContent value="csv" className="mt-4">
                      <UploadCsvForm
                        onClose={() => setIsCreateGuestModalOpen(false)}
                        eventId={eventId}
                      />
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>

              {/* Export */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-none border-zinc-200 px-3 text-xs font-medium text-zinc-600 hover:bg-zinc-50 gap-1.5"
                onClick={() => downloadGuestCsv()}
                disabled={isDownloadPending}
              >
                {isDownloadPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Export CSV
              </Button>

              <AddUserTypeDialog eventId={eventId} />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto lg:block">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-100 bg-zinc-50 hover:bg-zinc-50">
                {["Guest", "Contact", "Seating", "Messaging", "Type", ""].map(
                  (h, i) => (
                    <TableHead
                      key={i}
                      className={cn(
                        "px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400",
                        i === 5 && "text-right",
                      )}
                    >
                      {h}
                    </TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isPending ? (
                <TableRow className="hover:bg-white">
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-300" />
                  </TableCell>
                </TableRow>
              ) : !hasGuests ? (
                <TableRow className="hover:bg-white">
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <UserPlus className="h-7 w-7 text-zinc-300" />
                      <p className="text-sm font-medium text-zinc-500">
                        No guests yet
                      </p>
                      <p className="text-xs text-zinc-400">
                        Click "Add Guest" to get started
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : totalFilteredGuests === 0 ? (
                <TableRow className="hover:bg-white">
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-7 w-7 text-zinc-300" />
                      <p className="text-sm font-medium text-zinc-500">
                        No results
                      </p>
                      <p className="text-xs text-zinc-400">
                        Try a different search term
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedGuests.map((guest) => (
                  <TableRow
                    key={guest._id}
                    className="border-b border-zinc-100 hover:bg-zinc-50/60 transition-colors"
                  >
                    {/* Guest */}
                    <TableCell className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-md">
                          <AvatarFallback className="rounded-md bg-zinc-100 text-xs font-semibold text-zinc-600">
                            {getGuestInitials(guest.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-900">
                            {guest.name}
                          </p>
                          <p className="truncate text-xs text-zinc-400">
                            {guest.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell className="px-5 py-3">
                      <div className="space-y-0.5 text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-zinc-300" />
                          <span className="truncate">{guest.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-zinc-300" />
                          <span>{guest.phone || "—"}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Seating */}
                    <TableCell className="px-5 py-3">
                      <SeatingStatusBadge guest={guest} />
                    </TableCell>

                    {/* Messaging */}
                    <TableCell className="px-5 py-3">
                      <MessageStatusBadge guest={guest} />
                    </TableCell>

                    {/* Type */}
                    <TableCell className="px-5 py-3">
                      <GuestTypeBadge type={guest.type} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetailsClick(guest);
                          }}
                          className="h-7 rounded-none border-zinc-200 px-2.5 text-xs text-zinc-600 hover:bg-zinc-50"
                        >
                          <Info className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(guest);
                          }}
                          className="h-7 rounded-none border-zinc-200 px-2.5 text-xs text-zinc-600 hover:bg-zinc-50"
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(guest);
                          }}
                          className="h-7 rounded-none border-zinc-200 px-2.5 text-xs text-zinc-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          disabled={isDeletePending}
                        >
                          {isDeletePending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="divide-y divide-zinc-100 lg:hidden">
          {isPending ? (
            <div className="p-6 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-300" />
            </div>
          ) : !hasGuests ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center">
              <UserPlus className="h-7 w-7 text-zinc-300" />
              <p className="text-sm font-medium text-zinc-500">No guests yet</p>
              <p className="text-xs text-zinc-400">
                Click "Add Guest" to start
              </p>
            </div>
          ) : totalFilteredGuests === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center">
              <Search className="h-7 w-7 text-zinc-300" />
              <p className="text-sm font-medium text-zinc-500">No results</p>
              <p className="text-xs text-zinc-400">
                Try a different search term
              </p>
            </div>
          ) : (
            paginatedGuests.map((guest) => (
              <div
                key={guest._id}
                className="p-4 hover:bg-zinc-50/60 transition-colors"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Avatar className="h-9 w-9 rounded-md shrink-0">
                      <AvatarFallback className="rounded-md bg-zinc-100 text-xs font-semibold text-zinc-600">
                        {getGuestInitials(guest.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {guest.name}
                      </p>
                      <GuestTypeBadge type={guest.type} />
                    </div>
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  <SeatingStatusBadge guest={guest} />
                  <MessageStatusBadge guest={guest} />
                </div>

                <div className="mb-3 border border-zinc-100 bg-zinc-50 p-2.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Mail className="h-3 w-3 text-zinc-300" />
                    <span className="truncate">
                      {guest.email || "No email"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Phone className="h-3 w-3 text-zinc-300" />
                    <span>{guest.phone || "Not provided"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetailsClick(guest)}
                    className="h-8 rounded-none border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-50"
                  >
                    <Info className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(guest)}
                    className="h-8 rounded-none border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-50"
                  >
                    <Edit className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(guest)}
                    className="h-8 rounded-none border-zinc-200 text-xs text-zinc-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    disabled={isDeletePending}
                  >
                    {isDeletePending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {hasGuests && totalFilteredGuests > 0 && (
          <div className="flex flex-col gap-3 border-t border-zinc-100 bg-zinc-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-400">
              Showing {visibleGuestStart}–{visibleGuestEnd} of{" "}
              {totalFilteredGuests} guest{totalFilteredGuests === 1 ? "" : "s"}
            </p>
            {hasMultiplePages && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-7 rounded-none border-zinc-200 px-3 text-xs"
                >
                  Previous
                </Button>
                <span className="text-xs text-zinc-500">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-7 rounded-none border-zinc-200 px-3 text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Edit Dialog ── */}
      {selectedGuest && (
        <Dialog
          open={isEditGuestModalOpen}
          onOpenChange={setIsEditGuestModalOpen}
        >
          <DialogContent className="rounded-none sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-zinc-900">
                Edit Guest
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Update details for{" "}
                <strong className="text-zinc-700">{selectedGuest.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <EditGuestForm
              guest={selectedGuest}
              onClose={() => setIsEditGuestModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* ── View Dialog ── */}
      {selectedGuest && (
        <Dialog
          open={isViewGuestModalOpen}
          onOpenChange={setIsViewGuestModalOpen}
        >
          <DialogContent className="rounded-none sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-zinc-900">
                Guest Details
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Full profile for {selectedGuest.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              {/* Avatar row */}
              <div className="flex items-center gap-3 border border-zinc-100 bg-zinc-50 p-3">
                <Avatar className="h-10 w-10 rounded-md">
                  <AvatarFallback className="rounded-md bg-white text-sm font-semibold text-zinc-700">
                    {getGuestInitials(selectedGuest.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {selectedGuest.name}
                  </p>
                  <p className="truncate text-xs text-zinc-400">
                    {selectedGuest.email || "No email"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <SeatingStatusBadge guest={selectedGuest} />
                <MessageStatusBadge guest={selectedGuest} />
                <GuestTypeBadge type={selectedGuest.type} />
              </div>

              {/* Details table */}
              <div className="border border-zinc-100 divide-y divide-zinc-100">
                {[
                  { label: "Name", value: selectedGuest.name },
                  {
                    label: "Email",
                    value: selectedGuest.email || "Not provided",
                  },
                  {
                    label: "Phone",
                    value: selectedGuest.phone || "Not provided",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-4 px-4 py-2.5"
                  >
                    <span className="w-16 shrink-0 text-xs font-medium text-zinc-400">
                      {label}
                    </span>
                    <span className="text-xs text-zinc-700 break-all">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsViewGuestModalOpen(false)}
                className="h-8 rounded-none border-zinc-200 text-xs"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Delete Dialog ── */}
      <Dialog
        open={isDeleteConfirmModalOpen}
        onOpenChange={setIsDeleteConfirmModalOpen}
      >
        <DialogContent className="rounded-none sm:max-w-[440px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-red-50">
                <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
              </div>
              <DialogTitle className="text-sm font-semibold text-zinc-900">
                Remove guest?
              </DialogTitle>
            </div>
            <DialogDescription className="mt-3 text-sm text-zinc-500 leading-relaxed">
              You are about to remove{" "}
              <strong className="text-zinc-800">
                &quot;{guestToDelete?.name}&quot;
              </strong>{" "}
              from the guest list. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteConfirmModalOpen(false)}
              className="h-8 rounded-none border-zinc-200 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={confirmDelete}
              disabled={isDeletePending}
              className="h-8 rounded-none bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700"
            >
              {isDeletePending ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Removing…
                </>
              ) : (
                <>
                  <Trash2 className="mr-1.5 h-3 w-3" /> Remove Guest
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
