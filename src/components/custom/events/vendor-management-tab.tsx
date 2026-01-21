"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Mail,
  MessageSquare,
  Calendar,
  AlertTriangle,
  Building2,
} from "lucide-react";

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
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const query = useQueryClient();

  const handleEditClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsEditVendorModalOpen(true);
  };

  const handleDeleteClick = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setIsDeleteConfirmModalOpen(true);
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["delete-vendor"],
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data.error.message);
      }
      query.refetchQueries({ queryKey: ["get-all-vendor"], exact: false });
      toast.success("Vendor removed successfully");
      setIsDeleteConfirmModalOpen(false);
      setVendorToDelete(null);
    },
    onError: (error) => {
      return toast.error(error.message);
    },
  });

  const confirmDelete = () => {
    if (!vendorToDelete?._id) return toast.error("Vendor not found");
    mutate(vendorToDelete._id);
  };

  const pathName = usePathname();
  const { data, isPending: isLoading } = useQuery({
    queryKey: ["get-all-vendor"],
    queryFn: () => getAllVendor(pathName.split("/").pop() as string),
  });

  const hasVendors = data?.data && data.data.length > 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 px-4 ">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Vendor Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {hasVendors
              ? `Managing ${data?.data?.length} vendor${(data?.data?.length ?? 1) > 1 ? "s" : ""}`
              : "Add vendors to manage your event services"}
          </p>
        </div>

        <Dialog
          open={isCreateVendorModalOpen}
          onOpenChange={setIsCreateVendorModalOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-lime-600 hover:bg-lime-700 text-white h-11 px-6 font-medium whitespace-nowrap">
              <Plus className="mr-2 h-5 w-5" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Add New Vendor
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base pt-1">
                Enter vendor details and their service schedule
              </DialogDescription>
            </DialogHeader>
            <CreateVendorForm
              onAddVendor={onAddVendor}
              onClose={() => setIsCreateVendorModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Container */}
      <div className="border-y border-gray-200 bg-white overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                  Vendor Name
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                  Contact
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                  Service Period
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                  Category
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                  Reminder
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow className="hover:bg-white">
                  <TableCell colSpan={5} className="h-40 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : !hasVendors ? (
                <TableRow className="hover:bg-white">
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        No vendors yet
                      </p>
                      <p className="text-sm mt-1 text-gray-600">
                        Click "Add Vendor" button above to start
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.map((vendor) => (
                  <TableRow
                    key={vendor._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* Vendor Name */}
                    <TableCell className="py-4 px-6">
                      <span className="font-medium text-gray-900">
                        {vendor.name}
                      </span>
                    </TableCell>

                    {/* Contact */}
                    <TableCell className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <span className="truncate max-w-[200px]">
                            {vendor.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                          <span>{vendor.whatsapp}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Service Period */}
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>
                          {format(
                            new Date(vendor.starting_date),
                            "MMM dd, yyyy",
                          )}
                          {vendor.end_date &&
                            isValid(new Date(vendor.end_date)) && (
                              <>
                                {" "}
                                -{" "}
                                {format(
                                  new Date(vendor.end_date),
                                  "MMM dd, yyyy",
                                )}
                              </>
                            )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="text-sm text-gray-700">
                        {vendor?.category || "—"}
                      </span>
                    </TableCell>

                    {/* Reminder */}
                    <TableCell className="py-4 px-6">
                      <span className="text-sm text-gray-700">
                        {vendor.reminder_message || "—"}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(vendor)}
                          className="border-gray-300 hover:bg-lime-50 hover:text-lime-600 hover:border-lime-600 h-9 px-4"
                        >
                          <Edit className="h-4 w-4 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(vendor)}
                          className="border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-600 h-9 px-3"
                          disabled={isPending}
                        >
                          {isPending ? (
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
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            </div>
          ) : !hasVendors ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900">
                  No vendors yet
                </p>
                <p className="text-sm mt-1 text-gray-600">
                  Click "Add Vendor" to start
                </p>
              </div>
            </div>
          ) : (
            data?.data?.map((vendor) => (
              <div
                key={vendor._id}
                className="p-5 hover:bg-gray-50 transition-colors"
              >
                {/* Vendor Header */}
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {vendor.name}
                  </h3>
                </div>

                {/* Vendor Details */}
                <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 truncate">
                      {vendor.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900">{vendor.whatsapp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900">
                      {format(new Date(vendor.starting_date), "MMM dd, yyyy")}
                      {vendor.end_date &&
                        isValid(new Date(vendor.end_date)) && (
                          <>
                            {" "}
                            -{" "}
                            {format(new Date(vendor.end_date), "MMM dd, yyyy")}
                          </>
                        )}
                    </span>
                  </div>
                  {vendor.reminder_message && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Reminder:</p>
                      <p className="text-sm text-gray-900">
                        {vendor.reminder_message}
                      </p>
                    </div>
                  )}

                  {vendor?.category && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Category:</p>
                      <p className="text-sm text-gray-900">{vendor.category}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEditClick(vendor)}
                    className="border-gray-300 hover:bg-lime-50 hover:text-lime-600 hover:border-lime-600 h-11 font-medium"
                  >
                    <Edit className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteClick(vendor)}
                    className="border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-600 h-11 font-medium"
                    disabled={isPending}
                  >
                    {isPending ? (
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

      {/* Edit Vendor Modal */}
      {selectedVendor && (
        <Dialog
          open={isEditVendorModalOpen}
          onOpenChange={setIsEditVendorModalOpen}
        >
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Edit Vendor Details
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base pt-1">
                Update information for{" "}
                <strong className="text-gray-900">{selectedVendor.name}</strong>
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
              <span>Remove Vendor?</span>
            </DialogTitle>
            <DialogDescription className="text-gray-700 pt-4 text-base leading-relaxed">
              You are about to remove{" "}
              <strong className="text-gray-900 font-semibold">
                &quot;{vendorToDelete?.name}&quot;
              </strong>{" "}
              from your vendor list.
              <br />
              <br />
              <span className="text-red-600 font-medium">
                This action cannot be undone.
              </span>{" "}
              All vendor information and reminders will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3 sm:gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmModalOpen(false)}
              className="flex-1 sm:flex-none border-gray-300 h-12 font-medium hover:bg-gray-50"
            >
              Keep Vendor
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isPending}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white h-12 font-medium"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Yes, Remove Vendor
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
