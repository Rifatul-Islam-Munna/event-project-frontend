"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  UserPlus,
  Upload,
  Edit,
  Trash2,
  Info,
  Search,
  Loader2,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { CreateGuestForm } from "./create-guest-form";
import { UploadCsvForm } from "./upload-csv-form";
import { EditGuestForm } from "./edit-guest-form";
import { Guest } from "@/@types/events-details";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteGuest, getAllGuest } from "@/actions/fetch-action";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { User } from "@/@types/user-types";
import { getUserInfo } from "@/actions/auth";

type GuestListTabProps = {
  guests: Guest[];
  onAddGuest: (guest: Omit<Guest, "id">) => void;
  onUpdateGuest: (guest: Guest) => void;
  onDeleteGuest: (id: string) => void;
};

export function GuestListTab({
  guests,
  onAddGuest,
  onUpdateGuest,
  onDeleteGuest,
}: GuestListTabProps) {
  const [isCreateGuestModalOpen, setIsCreateGuestModalOpen] = useState(false);
  const [isEditGuestModalOpen, setIsEditGuestModalOpen] = useState(false);
  const [isViewGuestModalOpen, setIsViewGuestModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, SetUser] = useState<User | null>(null);

  useEffect(() => {
    const getuserInfo = async () => {
      const info = await getUserInfo();
      SetUser(info);
    };
    getuserInfo();
  }, []);

  const query = useQueryClient();

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

  const { mutate, isPending: IsDeletePending } = useMutation({
    mutationKey: ["deleteGuest"],
    mutationFn: (id: string) => deleteGuest(id),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data.error.message);
      }
      query.refetchQueries({ queryKey: ["get-all-guest"], exact: false });
      toast.success("Guest removed successfully");
      setIsDeleteConfirmModalOpen(false);
      setGuestToDelete(null);
    },
    onError: (error) => {
      return toast.error(error?.message);
    },
  });

  const confirmDelete = () => {
    if (!guestToDelete?._id) return toast.error("Guest not found");
    mutate(guestToDelete._id);
  };

  const pathName = usePathname();

  const { data, isPending } = useQuery({
    queryKey: ["get-all-guest"],
    queryFn: () => getAllGuest(pathName.split("/").pop() as string),
  });

  const filterSearch =
    data?.data?.filter(
      (guest) =>
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const hasGuests = data?.data && data.data.length > 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 px-4 ">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Guest List
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {hasGuests
              ? `Managing ${data?.data?.length} guest${(data?.data?.length ?? 0) > 1 ? "s" : ""}`
              : "Add your first guest to get started"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-lime-600 focus:ring-lime-600"
            />
          </div>

          {/* Add Guest Button */}
          <Dialog
            open={isCreateGuestModalOpen}
            onOpenChange={setIsCreateGuestModalOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-lime-600 hover:bg-lime-700 text-white h-11 px-6 font-medium whitespace-nowrap">
                <Plus className="mr-2 h-5 w-5" />
                Add Guest
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-gray-900">
                  Add New Guest
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-base pt-1">
                  Add guests individually or upload a CSV file for bulk import
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="manual" className="w-full mt-4">
                <TabsList className="w-full bg-white border-b border-gray-200 rounded-none p-0 h-auto flex justify-start gap-0">
                  <TabsTrigger
                    value="manual"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-transparent border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-lime-600 data-[state=active]:text-lime-600 data-[state=active]:bg-transparent rounded-none transition-all border-t-0 border-l-0 border-r-0"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="font-medium">Manual Entry</span>
                  </TabsTrigger>
                  {user?.plan?.permissions?.includes("csv.import") && (
                    <TabsTrigger
                      value="csv"
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-transparent border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-lime-600 data-[state=active]:text-lime-600 data-[state=active]:bg-transparent rounded-none transition-all border-t-0 border-l-0 border-r-0"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="font-medium">Upload CSV</span>
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="manual" className="mt-6">
                  <CreateGuestForm
                    onAddGuest={onAddGuest}
                    onClose={() => setIsCreateGuestModalOpen(false)}
                  />
                </TabsContent>

                <TabsContent value="csv" className="mt-6">
                  <UploadCsvForm
                    onClose={() => setIsCreateGuestModalOpen(false)}
                  />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table Container */}
      <div className="border-y border-gray-200 bg-white overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                  Guest Name
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                  Email
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                  Phone
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                  Seat Status
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isPending ? (
                <TableRow className="hover:bg-white">
                  <TableCell colSpan={5} className="h-40 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : !hasGuests ? (
                <TableRow className="hover:bg-white">
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <UserPlus className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        No guests yet
                      </p>
                      <p className="text-sm mt-1 text-gray-600">
                        Click "Add Guest" button above to start
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filterSearch?.length === 0 ? (
                <TableRow className="hover:bg-white">
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        No matches found
                      </p>
                      <p className="text-sm mt-1 text-gray-600">
                        Try different search terms
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filterSearch?.map((guest) => (
                  <TableRow
                    key={guest._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* Guest Name */}
                    <TableCell className="py-4 px-6">
                      <span className="font-medium text-gray-900">
                        {guest.name}
                      </span>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="py-4 px-6 text-gray-700">
                      {guest.email}
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="py-4 px-6 text-gray-700">
                      {guest.phone || "—"}
                    </TableCell>

                    {/* Seat Status */}
                    <TableCell className="py-4 px-6">
                      {guest.isAssigned ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle className="h-4 w-4" />
                          Seated #{guest.seat_number}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          <XCircle className="h-4 w-4" />
                          Not Seated
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetailsClick(guest);
                          }}
                          className="border-gray-300 hover:bg-lime-50 hover:text-lime-600 hover:border-lime-600 h-9 px-4"
                        >
                          <Info className="h-4 w-4 mr-1.5" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(guest);
                          }}
                          className="border-gray-300 hover:bg-lime-50 hover:text-lime-600 hover:border-lime-600 h-9 px-4"
                        >
                          <Edit className="h-4 w-4 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(guest);
                          }}
                          className="border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-600 h-9 px-3"
                          disabled={IsDeletePending}
                        >
                          {IsDeletePending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1.5" />
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

        {/* Mobile/Tablet Card Layout */}
        <div className="lg:hidden divide-y divide-gray-100">
          {isPending ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            </div>
          ) : !hasGuests ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <UserPlus className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900">
                  No guests yet
                </p>
                <p className="text-sm mt-1 text-gray-600">
                  Click "Add Guest" to start
                </p>
              </div>
            </div>
          ) : filterSearch.length === 0 ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900">
                  No matches found
                </p>
                <p className="text-sm mt-1 text-gray-600">
                  Try different search terms
                </p>
              </div>
            </div>
          ) : (
            filterSearch?.map((guest) => (
              <div
                key={guest._id}
                className="p-5 hover:bg-gray-50 transition-colors"
              >
                {/* Guest Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {guest.name}
                    </h3>
                    {guest.isAssigned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 mt-1">
                        <CheckCircle className="h-3 w-3" />
                        Seat #{guest.seat_number}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 mt-1">
                        <XCircle className="h-3 w-3" />
                        Not Seated
                      </span>
                    )}
                  </div>
                </div>

                {/* Guest Details */}
                <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 truncate">
                      {guest.email}
                    </span>
                  </div>
                  {guest.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900">{guest.phone}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetailsClick(guest)}
                    className="border-gray-300 hover:bg-lime-50 hover:text-lime-600 hover:border-lime-600 h-11 font-medium"
                  >
                    <Info className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEditClick(guest)}
                    className="border-gray-300 hover:bg-lime-50 hover:text-lime-600 hover:border-lime-600 h-11 font-medium"
                  >
                    <Edit className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteClick(guest)}
                    className="border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-600 h-11 font-medium"
                    disabled={IsDeletePending}
                  >
                    {IsDeletePending ? (
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
      </div>

      {/* Edit Guest Modal */}
      {selectedGuest && (
        <Dialog
          open={isEditGuestModalOpen}
          onOpenChange={setIsEditGuestModalOpen}
        >
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Edit Guest Details
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base pt-1">
                Update information for{" "}
                <strong className="text-gray-900">{selectedGuest.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <EditGuestForm
              guest={selectedGuest}
              onUpdateGuest={onUpdateGuest}
              onClose={() => setIsEditGuestModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Guest Details Modal */}
      {selectedGuest && (
        <Dialog
          open={isViewGuestModalOpen}
          onOpenChange={setIsViewGuestModalOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Guest Details
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base pt-1">
                Complete information for {selectedGuest.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Label className="text-sm font-medium text-gray-600 w-24 flex-shrink-0 pt-0.5">
                    Name:
                  </Label>
                  <span className="text-base text-gray-900 font-medium">
                    {selectedGuest.name}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <Label className="text-sm font-medium text-gray-600 w-24 flex-shrink-0 pt-0.5">
                    Email:
                  </Label>
                  <span className="text-sm text-gray-900 break-all">
                    {selectedGuest.email}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <Label className="text-sm font-medium text-gray-600 w-24 flex-shrink-0 pt-0.5">
                    Phone:
                  </Label>
                  <span className="text-sm text-gray-900">
                    {selectedGuest.phone || "Not provided"}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <Label className="text-sm font-medium text-gray-600 w-24 flex-shrink-0 pt-0.5">
                    Status:
                  </Label>
                  {selectedGuest.isAssigned ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      Seat #{selectedGuest.seat_number}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      <XCircle className="h-4 w-4" />
                      Not Assigned
                    </span>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewGuestModalOpen(false)}
                className="border-gray-300 hover:bg-gray-50 font-medium h-11"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteConfirmModalOpen}
        onOpenChange={setIsDeleteConfirmModalOpen}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-red-600 text-2xl">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <span>Remove Guest?</span>
            </DialogTitle>
            <DialogDescription className="text-gray-700 pt-4 text-base leading-relaxed">
              You are about to remove{" "}
              <strong className="text-gray-900 font-semibold">
                &quot;{guestToDelete?.name}&quot;
              </strong>{" "}
              from your guest list.
              <br />
              <br />
              <span className="text-red-600 font-medium">
                This action cannot be undone.
              </span>{" "}
              The guest will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3 sm:gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmModalOpen(false)}
              className="flex-1 sm:flex-none border-gray-300 h-12 font-medium hover:bg-gray-50"
            >
              Keep Guest
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={IsDeletePending}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white h-12 font-medium"
            >
              {IsDeletePending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
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
