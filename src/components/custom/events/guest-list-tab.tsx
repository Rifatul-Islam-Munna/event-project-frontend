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

const GUESTS_PER_PAGE = 10;

const getGuestInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

function GuestMetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "slate" | "emerald" | "amber" | "sky";
}) {
  const toneClassName =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : tone === "sky"
          ? "bg-sky-50 text-sky-700"
          : "bg-slate-100 text-slate-700";

  return (
    <div className="rounded-[20px] border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <p className="mt-1.5 text-xl font-semibold text-slate-900">{value}</p>
        </div>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClassName}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

function SeatingStatusBadge({ guest }: { guest: Guest }) {
  return guest.isAssigned ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
      <CheckCircle className="h-3.5 w-3.5" />
      Seated {guest.seat_number ? `#${guest.seat_number}` : ""}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
      <XCircle className="h-3.5 w-3.5" />
      Not Seated
    </span>
  );
}

function MessageStatusBadge({ guest }: { guest: Guest }) {
  return guest.isMessageSend ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700">
      <Send className="h-3.5 w-3.5" />
      Message Sent
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
      <XCircle className="h-3.5 w-3.5" />
      Message Pending
    </span>
  );
}

function GuestTypeBadge({ type }: { type?: string }) {
  return (
    <Badge className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100">
      {type?.trim() || "N/A"}
    </Badge>
  );
}

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

  const { mutate: downloadGuestCsv, isPending: isDownloadPending } = useMutation({
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

  const { mutate: deleteGuestMutation, isPending: isDeletePending } = useMutation({
    mutationKey: ["deleteGuest"],
    mutationFn: (id: string) => deleteGuest(id),
    onSuccess: (result) => {
      if (result?.error) {
        toast.error(result.error.message);
        return;
      }

      queryClient.refetchQueries({ queryKey: ["get-all-guest"], exact: false });
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
  const seatedGuestsCount =
    data?.data?.filter((guest) => guest.isAssigned).length ?? 0;
  const unseatedGuestsCount = Math.max(0, totalGuests - seatedGuestsCount);
  const messageSentGuestsCount =
    data?.data?.filter((guest) => guest.isMessageSend).length ?? 0;
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
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4 p-3 md:p-4">
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.1),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] p-4 shadow-sm shadow-slate-900/5 md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Guest Management
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Guest List
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-5 text-slate-600">
              Keep guests, seating, messages, and imports organized in one cleaner workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3.5 text-sm font-medium text-slate-700 shadow-sm">
              <Users className="h-4 w-4 text-slate-500" />
              <span>{totalGuests} total guests</span>
            </div>
            <div className="inline-flex h-9 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 text-sm font-medium text-emerald-700">
              <UserCheck className="h-4 w-4" />
              <span>{seatedGuestsCount} seated</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
          <GuestMetricCard
            icon={<Users className="h-5 w-5" />}
            label="Total Guests"
            value={String(totalGuests)}
            tone="slate"
          />
          <GuestMetricCard
            icon={<UserCheck className="h-5 w-5" />}
            label="Seated Guests"
            value={String(seatedGuestsCount)}
            tone="emerald"
          />
          <GuestMetricCard
            icon={<UserX className="h-5 w-5" />}
            label="Waiting For Seat"
            value={String(unseatedGuestsCount)}
            tone="amber"
          />
          <GuestMetricCard
            icon={<Send className="h-5 w-5" />}
            label="Messages Sent"
            value={String(messageSentGuestsCount)}
            tone="sky"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
        <div className="border-b border-slate-200/80 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Guests Directory
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {hasGuests
                  ? `Showing ${totalFilteredGuests} result${totalFilteredGuests === 1 ? "" : "s"} from ${totalGuests} guest${totalGuests === 1 ? "" : "s"}.`
                  : "Add your first guest to start building the seating list."}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center">
              <div className="relative w-full xl:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-10 focus-visible:ring-emerald-500"
                />
              </div>

              <Select
                value={typeOfUser ?? "all"}
                onValueChange={(value) =>
                  setTypeOfUser(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 xl:w-44">
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

              <Dialog
                open={isCreateGuestModalOpen}
                onOpenChange={setIsCreateGuestModalOpen}
              >
                <DialogTrigger asChild>
                  <Button className="h-10 rounded-xl bg-emerald-700 px-4 font-medium text-white hover:bg-emerald-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Guest
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                      Add New Guest
                    </DialogTitle>
                    <DialogDescription className="pt-1 text-sm text-gray-600">
                      Add guests individually or upload a CSV file for bulk import
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="manual" className="mt-3 w-full">
                    <TabsList className="flex h-auto w-full justify-start gap-0 rounded-none border-b border-gray-200 bg-white p-0">
                      <TabsTrigger
                        value="manual"
                        className="flex-1 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-5 py-2.5 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 data-[state=active]:border-lime-600 data-[state=active]:bg-transparent data-[state=active]:text-lime-600"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span className="font-medium">Manual Entry</span>
                      </TabsTrigger>
                      {user?.plan?.permissions?.includes("csv.import") && (
                        <TabsTrigger
                          value="csv"
                          className="flex-1 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-5 py-2.5 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 data-[state=active]:border-lime-600 data-[state=active]:bg-transparent data-[state=active]:text-lime-600"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          <span className="font-medium">Upload CSV</span>
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

              <Button
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-slate-700 shadow-none hover:bg-slate-50"
                onClick={() => downloadGuestCsv()}
                disabled={isDownloadPending}
              >
                {isDownloadPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export Seating CSV
              </Button>

              <AddUserTypeDialog eventId={eventId} />
            </div>
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Guest
                </TableHead>
                <TableHead className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Contact
                </TableHead>
                <TableHead className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Seating
                </TableHead>
                <TableHead className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Messaging
                </TableHead>
                <TableHead className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Guest Type
                </TableHead>
                <TableHead className="px-5 py-3 text-right text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isPending ? (
                <TableRow className="hover:bg-white">
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
                  </TableCell>
                </TableRow>
              ) : !hasGuests ? (
                <TableRow className="hover:bg-white">
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                        <UserPlus className="h-7 w-7 text-slate-400" />
                      </div>
                      <p className="text-base font-medium text-slate-900">
                        No guests yet
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Click &quot;Add Guest&quot; button above to start
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : totalFilteredGuests === 0 ? (
                <TableRow className="hover:bg-white">
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                        <Search className="h-7 w-7 text-slate-400" />
                      </div>
                      <p className="text-base font-medium text-slate-900">
                        No matches found
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Try different search terms
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedGuests.map((guest) => (
                  <TableRow
                    key={guest._id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/80"
                  >
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-slate-100 text-sm font-semibold text-slate-700">
                            {getGuestInitials(guest.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {guest.name}
                          </p>
                          <p className="truncate text-sm text-slate-500">
                            {guest.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-3.5 text-slate-700">
                      <div className="space-y-1 text-sm">
                        <div className="inline-flex items-center gap-2 text-slate-700">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="truncate">{guest.email || "No email"}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 text-slate-500">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{guest.phone || "Not provided"}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-3.5">
                      <SeatingStatusBadge guest={guest} />
                    </TableCell>

                    <TableCell className="px-5 py-3.5">
                      <MessageStatusBadge guest={guest} />
                    </TableCell>

                    <TableCell className="px-5 py-3.5">
                      <GuestTypeBadge type={guest.type} />
                    </TableCell>

                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetailsClick(guest);
                          }}
                          className="h-8 rounded-lg border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Info className="mr-1.5 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(guest);
                          }}
                          className="h-8 rounded-lg border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Edit className="mr-1.5 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(guest);
                          }}
                          className="h-8 rounded-lg border-slate-200 px-3 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          disabled={isDeletePending}
                        >
                          {isDeletePending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="mr-1.5 h-4 w-4" />
                              Remove
                            </>
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

        <div className="divide-y divide-slate-100 lg:hidden">
          {isPending ? (
            <div className="p-6 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : !hasGuests ? (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center justify-center text-slate-500">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <UserPlus className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-base font-medium text-slate-900">
                  No guests yet
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Click &quot;Add Guest&quot; to start
                </p>
              </div>
            </div>
          ) : totalFilteredGuests === 0 ? (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center justify-center text-slate-500">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Search className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-base font-medium text-slate-900">
                  No matches found
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Try different search terms
                </p>
              </div>
            </div>
          ) : (
            paginatedGuests.map((guest) => (
              <div
                key={guest._id}
                className="p-4 transition-colors hover:bg-slate-50/80"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-slate-100 text-sm font-semibold text-slate-700">
                        {getGuestInitials(guest.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-slate-900">
                        {guest.name}
                      </h3>
                      <div className="mt-1">
                        <GuestTypeBadge type={guest.type} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <SeatingStatusBadge guest={guest} />
                  <MessageStatusBadge guest={guest} />
                </div>

                <div className="mb-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <span className="truncate text-slate-900">
                      {guest.email || "No email"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <span className="text-slate-900">
                      {guest.phone || "Not provided"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetailsClick(guest)}
                    className="h-10 rounded-xl border-slate-200 font-medium hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Info className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEditClick(guest)}
                    className="h-10 rounded-xl border-slate-200 font-medium hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Edit className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteClick(guest)}
                    className="h-10 rounded-xl border-slate-200 font-medium hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    disabled={isDeletePending}
                  >
                    {isDeletePending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {hasGuests && totalFilteredGuests > 0 ? (
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Showing {visibleGuestStart}-{visibleGuestEnd} of{" "}
              {totalFilteredGuests} guest
              {totalFilteredGuests === 1 ? "" : "s"}
            </p>

            {hasMultiplePages ? (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((previous) => Math.max(1, previous - 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-xl border-slate-200"
                >
                  Previous
                </Button>
                <span className="min-w-24 text-center text-sm font-medium text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((previous) =>
                      Math.min(totalPages, previous + 1),
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-xl border-slate-200"
                >
                  Next
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {selectedGuest && (
        <Dialog
          open={isEditGuestModalOpen}
          onOpenChange={setIsEditGuestModalOpen}
        >
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Edit Guest Details
              </DialogTitle>
              <DialogDescription className="pt-1 text-sm text-gray-600">
                Update information for{" "}
                <strong className="text-gray-900">{selectedGuest.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <EditGuestForm
              guest={selectedGuest}
              onClose={() => setIsEditGuestModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {selectedGuest && (
        <Dialog
          open={isViewGuestModalOpen}
          onOpenChange={setIsViewGuestModalOpen}
        >
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Guest Details
              </DialogTitle>
              <DialogDescription className="pt-1 text-sm text-gray-600">
                Complete information for {selectedGuest.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3">
              <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-white text-base font-semibold text-slate-700">
                    {getGuestInitials(selectedGuest.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-slate-900">
                    {selectedGuest.name}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {selectedGuest.email || "No email"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <SeatingStatusBadge guest={selectedGuest} />
                <MessageStatusBadge guest={selectedGuest} />
                <GuestTypeBadge type={selectedGuest.type} />
              </div>

              <div className="space-y-2.5 rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/5">
                <div className="flex items-start gap-3">
                  <Label className="w-24 flex-shrink-0 pt-0.5 text-sm font-medium text-slate-500">
                    Name
                  </Label>
                  <span className="text-sm font-medium text-slate-900">
                    {selectedGuest.name}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Label className="w-24 flex-shrink-0 pt-0.5 text-sm font-medium text-slate-500">
                    Email
                  </Label>
                  <span className="break-all text-sm text-slate-900">
                    {selectedGuest.email || "Not provided"}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Label className="w-24 flex-shrink-0 pt-0.5 text-sm font-medium text-slate-500">
                    Phone
                  </Label>
                  <span className="text-sm text-slate-900">
                    {selectedGuest.phone || "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewGuestModalOpen(false)}
                className="h-10 border-gray-300 font-medium hover:bg-gray-50"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={isDeleteConfirmModalOpen}
        onOpenChange={setIsDeleteConfirmModalOpen}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl text-red-600">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <span>Remove Guest?</span>
            </DialogTitle>
            <DialogDescription className="pt-3 text-sm leading-6 text-gray-700">
              You are about to remove{" "}
              <strong className="font-semibold text-gray-900">
                &quot;{guestToDelete?.name}&quot;
              </strong>{" "}
              from your guest list.
              <br />
              <br />
              <span className="font-medium text-red-600">
                This action cannot be undone.
              </span>{" "}
              The guest will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmModalOpen(false)}
              className="h-10 flex-1 border-gray-300 font-medium hover:bg-gray-50 sm:flex-none"
            >
              Keep Guest
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeletePending}
              className="h-10 flex-1 bg-red-600 font-medium text-white hover:bg-red-700 sm:flex-none"
            >
              {isDeletePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Yes, Remove Guest
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
