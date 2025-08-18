"use client";

import { useState } from "react";
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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";

import { CreateVendorForm } from "./create-vendor-form";
import { EditVendorForm } from "./edit-vendor-form";
import { format, isValid } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteVendor, getAllVendor } from "@/actions/fetch-action";
import { usePathname } from "next/navigation";
import { Vendor } from "@/@types/events-details";

type VendorManagementTabProps = {
  vendors: Vendor[];
  onAddVendor: (vendor: Omit<Vendor, "id">) => void;
  onUpdateVendor: (vendor: Vendor) => void;
  onDeleteVendor: (id: string) => void;
};

export function VendorManagementTab({
  vendors,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor,
}: VendorManagementTabProps) {
  const [isCreateVendorModalOpen, setIsCreateVendorModalOpen] = useState(false);
  const [isEditVendorModalOpen, setIsEditVendorModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const query = useQueryClient();
  const handleEditClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsEditVendorModalOpen(true);
  };
  const { mutate, isPending } = useMutation({
    mutationKey: ["update-vendor"],
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data.error.message);
      }
      query.refetchQueries({ queryKey: ["get-all-vendor"], exact: false });
      return toast.success("Vendor deleted successfully");
    },
    onError: (error) => {
      return toast.error(error.message);
    },
  });

  const handleDeleteClick = (vendorId?: string) => {
    if (!vendorId) return toast.error("Vendor not found");
    mutate(vendorId);
  };
  const pathName = usePathname();
  const { data } = useQuery({
    queryKey: ["get-all-vendor"],
    queryFn: () => getAllVendor(pathName.split("/").pop() as string),
  });

  return (
    <Card className="border-none shadow-none bg-transparent p-0">
      {" "}
      {/* Removed border and padding */}
      <CardHeader className="flex flex-row items-center justify-between px-0 pt-0 pb-4">
        {" "}
        {/* Adjusted padding */}
        <CardTitle className="text-xl font-bold text-foreground">
          Vendor Management
        </CardTitle>
        <Dialog
          open={isCreateVendorModalOpen}
          onOpenChange={setIsCreateVendorModalOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border border-border bg-background">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Add New Vendor
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter details for a new vendor and their reminder schedule.
              </DialogDescription>
            </DialogHeader>
            <CreateVendorForm
              onAddVendor={onAddVendor}
              onClose={() => setIsCreateVendorModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {" "}
        {/* Removed padding */}
        {data?.data?.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-8">
            No vendors added yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data?.map((vendor) => (
              <Card
                key={vendor._id}
                className="border border-gray-200/80 shadow-none bg-background p-4 flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-semibold text-foreground text-lg">
                    {vendor?.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Email: {vendor?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    WhatsApp: {vendor?.whatsapp}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Reminder: {vendor?.reminder_message || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Schedule:{" "}
                    {format(new Date(vendor.starting_date), "MMM dd, yyyy")} -{" "}
                    {isValid(vendor?.end_date) &&
                      format(new Date(vendor?.end_date ?? ""), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(vendor)}
                    className="text-muted-foreground hover:bg-muted hover:text-primary p-1 h-7 w-7" // Even smaller size
                    aria-label={`Edit ${vendor.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(vendor._id)}
                    className="text-muted-foreground hover:bg-muted hover:text-destructive p-1 h-7 w-7" // Even smaller size
                    aria-label={`Delete ${vendor.name}`}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
      {/* Edit Vendor Modal */}
      {selectedVendor && (
        <Dialog
          open={isEditVendorModalOpen}
          onOpenChange={setIsEditVendorModalOpen}
        >
          <DialogContent className="sm:max-w-[425px] border border-border bg-background">
            <DialogHeader>
              <DialogTitle className="text-foreground">Edit Vendor</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Make changes to vendor details.
              </DialogDescription>
            </DialogHeader>
            <EditVendorForm
              vendor={selectedVendor}
              onUpdateVendor={onUpdateVendor}
              onClose={() => setIsEditVendorModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
