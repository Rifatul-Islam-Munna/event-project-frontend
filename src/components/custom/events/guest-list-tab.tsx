"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
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

  const handleDeleteClick = (guestId: string | undefined) => {
    if (!guestId) return toast.error("Guest not found");
    mutate(guestId);
  };
  const pathName = usePathname();

  const { data, isPending } = useQuery({
    queryKey: ["get-all-guest"],
    queryFn: () => getAllGuest(pathName.split("/").pop() as string),
  });
  const filterSeach =
    data?.data?.filter(
      (guest) =>
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <Card className="border-none bg-transparent shadow-none p-0">
      {" "}
      {/* Removed border and padding */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 sm:gap-0">
        <CardTitle className="text-xl font-bold text-foreground">
          Guest List
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-border focus:ring-primary focus:border-primary"
            />
          </div>
          <Dialog
            open={isCreateGuestModalOpen}
            onOpenChange={setIsCreateGuestModalOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Plus className="mr-2 h-4 w-4" /> Add Guest
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border border-border bg-background">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Add New Guest(s)
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Manually add a guest or upload a CSV file for bulk import.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="manual" className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-2 border-b border-border bg-transparent rounded-none p-0 h-auto">
                  <TabsTrigger
                    value="manual"
                    className="flex items-center gap-2 data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0    text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-[hsl(185_70%_40%)] rounded-none py-3 px-4"
                  >
                    <UserPlus className="h-4 w-4" /> Manual Entry
                  </TabsTrigger>
                  {user?.plan?.permissions?.includes("csv.import") ? (
                    <TabsTrigger
                      value="csv"
                      className="flex items-center data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0  gap-2 text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-[hsl(185_70%_40%)] rounded-none py-3 px-4"
                    >
                      <Upload className="h-4 w-4" /> Upload CSV
                    </TabsTrigger>
                  ) : null}
                </TabsList>
                <TabsContent value="manual" className="mt-4">
                  <CreateGuestForm
                    onAddGuest={onAddGuest}
                    onClose={() => setIsCreateGuestModalOpen(false)}
                  />
                </TabsContent>
                <TabsContent value="csv" className="mt-4">
                  <UploadCsvForm
                    onClose={() => setIsCreateGuestModalOpen(false)}
                  />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {" "}
        {/* Removed max-height and overflow, removed padding */}
        {data?.data?.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-8">
            {searchQuery ? "No matching guests found." : "No guests added yet."}
          </p>
        ) : isPending ? (
          <div className=" w-full flex items-center justify-center min-h-[20dvh]">
            <Loader2 className=" w-10 h-10 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filterSeach?.map((guest) => (
              <Card
                key={guest?.email + guest?._id}
                className="border border-gray-200/70 shadow-none bg-gradient-to-bl from-blue-50 to-blue-100/80 p-2 flex flex-col justify-between h-auto min-h-[80px]" // Reduced min-height
              >
                <div>
                  <h4 className="font-semibold text-sm truncate">
                    {guest?.name}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({guest?.email})
                    </span>
                  </h4>
                </div>
                <div className="flex gap-1  justify-end">
                  {" "}
                  {/* Reduced mt */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetailsClick(guest)}
                    className="text-muted-foreground hover:bg-muted hover:text-primary p-1 h-7 w-7" // Even smaller size
                    aria-label={`View details for ${guest?.name}`}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(guest)}
                    className="text-muted-foreground hover:bg-muted hover:text-primary p-1 h-7 w-7" // Even smaller size
                    aria-label={`Edit ${guest?.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(guest?._id)}
                    className="text-muted-foreground hover:bg-muted hover:text-destructive p-1 h-7 w-7" // Even smaller size
                    aria-label={`Delete ${guest?.name}`}
                    disabled={IsDeletePending}
                  >
                    {IsDeletePending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      {/* Edit Guest Modal */}
      {selectedGuest && (
        <Dialog
          open={isEditGuestModalOpen}
          onOpenChange={setIsEditGuestModalOpen}
        >
          <DialogContent className="sm:max-w-[425px] border border-border bg-background">
            <DialogHeader>
              <DialogTitle className="text-foreground">Edit Guest</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Make changes to guest details.
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
          <DialogContent className="sm:max-w-[425px] border border-border bg-background">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Guest Details: {selectedGuest?.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Full information for {selectedGuest?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-foreground">Name:</Label>
                <span className="col-span-3 text-muted-foreground">
                  {selectedGuest?.name}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-foreground">Email:</Label>
                <span className="col-span-3 text-muted-foreground">
                  {selectedGuest?.email}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-foreground">Phone:</Label>
                <span className="col-span-3 text-muted-foreground">
                  {selectedGuest?.phone || "N/A"}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-foreground">Assigned:</Label>
                <span className="col-span-3 text-muted-foreground">
                  {selectedGuest?.isAssigned ? "Yes" : "No"}
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsViewGuestModalOpen(false)}
                className="border-border text-foreground hover:bg-muted"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
