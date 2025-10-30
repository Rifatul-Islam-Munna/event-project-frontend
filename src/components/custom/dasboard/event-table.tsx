"use client";

import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Event } from "@/app/dashboard/page";
import {
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
  Share2,
  ExternalLink,
  Copy,
} from "lucide-react";

import { EditEventForm } from "./edit-event-form";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateEventForm } from "./create-event-from";
import { QRCodeCanvas } from "qrcode.react";
import { useQuery } from "@tanstack/react-query";
import { getAllEvent } from "@/actions/fetch-action";
import { EventItem } from "@/@types/events-details";
import { User } from "@/@types/user-types";
import { getUserInfo } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { isAfter } from "date-fns";

type EventTableProps = {
  events: Event[];
  onAddEvent: (event: {
    name: string;
    date: string;
    location: string;
    logoFile?: File | null;
  }) => void;
  onUpdateEvent: (event: Event & { logoFile?: File | null }) => void;
  onDeleteEvent: (id: string) => void;
  onManageEvent: (slug: string) => void;
};

const ITEMS_PER_PAGE = 5;

export function EventTable({
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onManageEvent,
}: EventTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [sharingEvent, setSharingEvent] = useState<EventItem | null>(null);
  const qrCodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [user, SetUser] = useState<User | null>(null);

  useEffect(() => {
    const getuserInfo = async () => {
      const info = await getUserInfo();
      SetUser(info);
    };
    getuserInfo();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditClick = (event: EventItem) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (event: EventItem) => {
    setEventToDelete(event);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      onDeleteEvent(eventToDelete._id);
      setIsDeleteConfirmModalOpen(false);
      setEventToDelete(null);
    }
  };
  const router = useRouter();

  const handleShareClick = (event: EventItem) => {
    setSharingEvent(event);
    setIsShareModalOpen(true);
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeCanvasRef.current) return;
    const url = qrCodeCanvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-qrcode.png`;
    a.click();
  };
  const isSubscriptionActive = user?.subscription?.endDate
    ? isAfter(new Date(user.subscription.endDate), new Date())
    : false;

  const { data, error } = useQuery({
    queryKey: ["get-all-events", currentPage],
    queryFn: () => getAllEvent(currentPage, 10),
  });

  return (
    <div className="w-full">
      {/* Header Section - Clean and Compact */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-blue-600">Your Events</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={isSubscriptionActive === false}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Create New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Fill in the details to set up your next event.
              </DialogDescription>
            </DialogHeader>
            <CreateEventForm
              onAddEvent={onAddEvent}
              onClose={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Card - Clean borders, no shadow */}
      <Card className="border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            {/* Table Header - Subtle background */}
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="font-semibold text-gray-700 py-3">
                  Logo
                </TableHead>
                <TableHead className="font-semibold text-gray-700 py-3">
                  Event Name
                </TableHead>
                <TableHead className="font-semibold text-gray-700 py-3">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-gray-700 py-3">
                  Location
                </TableHead>
                <TableHead className="font-semibold text-gray-700 py-3">
                  Size (m)
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-center py-3">
                  Manage
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-right py-3">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {data?.data?.data?.length === 0 || data?.error ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-gray-500"
                  >
                    No events created yet.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.data?.map((event, index) => (
                  <TableRow
                    key={event._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* Logo */}
                    <TableCell
                      onClick={() =>
                        router.push(`/dashboard/details/${event._id}`)
                      }
                      className="py-3 cursor-pointer"
                    >
                      {event.logo_path ? (
                        <Image
                          src={event.logo_path as string}
                          alt={`${event.name} logo`}
                          width={40}
                          height={40}
                          className="rounded-full w-10 h-10 object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs border border-gray-200">
                          No Logo
                        </div>
                      )}
                    </TableCell>

                    {/* Event Name */}
                    <TableCell
                      onClick={() =>
                        router.push(`/dashboard/details/${event._id}`)
                      }
                      className="font-medium text-gray-900 py-3 cursor-pointer"
                    >
                      {event.name}
                    </TableCell>

                    {/* Date */}
                    <TableCell
                      onClick={() =>
                        router.push(`/dashboard/details/${event._id}`)
                      }
                      className="text-gray-600 text-sm py-3 cursor-pointer"
                    >
                      {event.date}
                    </TableCell>

                    {/* Location */}
                    <TableCell
                      onClick={() =>
                        router.push(`/dashboard/details/${event._id}`)
                      }
                      className="text-gray-600 text-sm py-3 max-w-[200px] truncate cursor-pointer"
                    >
                      {event.location}
                    </TableCell>

                    {/* Size */}
                    <TableCell className="text-gray-600 text-sm py-3">
                      {event.width} × {event.height}
                    </TableCell>

                    {/* Manage Button */}
                    <TableCell className="text-center py-3">
                      <Button
                        size="sm"
                        onClick={() =>
                          onManageEvent(event._id, event.width, event.height)
                        }
                        disabled={isSubscriptionActive === false}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4"
                      >
                        Manage
                      </Button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right py-3">
                      <div className="flex items-center justify-end gap-1">
                        {user?.plan?.permissions?.includes("qr.live") && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleShareClick(event)}
                              className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(event)}
                              className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(event)}
                              className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination - Clean design */}
      {(data?.data?.metaData?.page ?? 0) > 1 && (
        <div className="flex justify-center mt-5">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-gray-100"
                  }
                />
              </PaginationItem>
              {Array.from(
                { length: data?.data?.metaData?.page ?? 0 },
                (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={() => handlePageChange(i + 1)}
                      isActive={currentPage === i + 1}
                      className={
                        currentPage === i + 1
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "hover:bg-gray-100"
                      }
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === (data?.data?.metaData?.page ?? 0)
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-gray-100"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Edit Modal */}
      {editingEvent && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Make changes to your event here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <EditEventForm
              event={editingEvent}
              onClose={() => setIsEditModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteConfirmModalOpen}
        onOpenChange={setIsDeleteConfirmModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the event &quot;
              {eventToDelete?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      {sharingEvent && (
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-blue-600" />
                Share Event: {sharingEvent.name}
              </DialogTitle>
              <DialogDescription>
                Share this link and QR code with your guests.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Shareable Link */}
              <div className="space-y-2">
                <Label htmlFor="shareLink">Shareable Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="shareLink"
                    readOnly
                    value={`${window.location.origin}/public-view/event/${sharingEvent._id}`}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `${window.location.origin}/public-view/event/${sharingEvent._id}`
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={`${window.location.origin}/public-view/event/${sharingEvent._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div className="space-y-2">
                <Label className="text-center block">QR Code</Label>
                <div className="p-4 bg-white rounded-md border border-gray-200 flex justify-center">
                  <QRCodeCanvas
                    value={`${window.location.origin}/public-view/event/${sharingEvent._id}`}
                    ref={qrCodeCanvasRef}
                    size={200}
                    level="H"
                  />
                </div>
                <Button
                  onClick={handleDownloadQrCode}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Download QR Code
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsShareModalOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
