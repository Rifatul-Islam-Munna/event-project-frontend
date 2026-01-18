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
  Settings,
  QrCode,
  Check,
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
  const [linkCopied, setLinkCopied] = useState(false);
  const qrCodeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [user, SetUser] = useState<User | null>(null);

  const router = useRouter();

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

  const handleShareClick = (event: EventItem) => {
    setSharingEvent(event);
    setIsShareModalOpen(true);
    setLinkCopied(false);
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeCanvasRef.current) return;
    const url = qrCodeCanvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sharingEvent?.name}-qrcode.png`;
    a.click();
  };

  const handleCopyLink = () => {
    if (sharingEvent) {
      navigator.clipboard.writeText(
        `${window.location.origin}/public-view/event/${sharingEvent._id}`,
      );
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const isSubscriptionActive = user?.subscription?.endDate
    ? isAfter(new Date(user.subscription.endDate), new Date())
    : false;

  const { data, error } = useQuery({
    queryKey: ["get-all-events", currentPage],
    queryFn: () => getAllEvent(currentPage, 10),
  });

  const hasEvents = data?.data?.data && data.data.data.length > 0;

  return (
    <div className="w-full">
      {/* Header - Full Width */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Your Events
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {hasEvents
              ? `Managing ${data?.data?.data?.length} event${
                  (data?.data?.data?.length ?? 0) > 1 ? "s" : ""
                }`
              : "Create your first event to get started"}
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={!isSubscriptionActive}
              className="bg-lime-600 hover:bg-lime-700 text-white font-medium px-6 h-12 text-base whitespace-nowrap disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Create New Event
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base pt-1">
                Fill in the details below to create a new event page for your
                attendees
              </DialogDescription>
            </DialogHeader>
            <CreateEventForm
              onAddEvent={onAddEvent}
              onClose={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Subscription Warning - Full Width */}
      {!isSubscriptionActive && (
        <div className="mb-6 mx-4 sm:mx-6 lg:mx-8 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded-r-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Your subscription has expired. Please renew to create and manage
              events.
            </p>
          </div>
        </div>
      )}

      {/* Table Container - Full Width */}
      <div className="border-y border-gray-200 bg-white">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                  Event
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                  Location
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                  Size (meters)
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!hasEvents || error ? (
                <TableRow className="hover:bg-white">
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Plus className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        No events yet
                      </p>
                      <p className="text-sm mt-1 text-gray-600">
                        Click "Create New Event" button above to start
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.data.data.map((event) => (
                  <TableRow
                    key={event._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* Event Name + Logo */}
                    <TableCell
                      onClick={() =>
                        router.push(`/dashboard/details/${event._id}`)
                      }
                      className="py-4 px-6 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        {event.logo_path ? (
                          <Image
                            src={event.logo_path as string}
                            alt=""
                            width={56}
                            height={56}
                            className="rounded-lg w-14 h-14 object-cover border border-gray-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 flex-shrink-0">
                            <Plus className="h-6 w-6" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 text-base">
                          {event.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell
                      onClick={() =>
                        router.push(`/dashboard/details/${event._id}`)
                      }
                      className="text-gray-700 py-4 px-6 whitespace-nowrap cursor-pointer"
                    >
                      {event.date}
                    </TableCell>

                    {/* Location */}
                    <TableCell
                      onClick={() =>
                        router.push(`/dashboard/details/${event._id}`)
                      }
                      className="text-gray-700 py-4 px-6 max-w-[300px] cursor-pointer"
                    >
                      <span className="line-clamp-1">{event.location}</span>
                    </TableCell>

                    {/* Size */}
                    <TableCell className="text-gray-700 py-4 px-6 whitespace-nowrap">
                      {event.width} × {event.height}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-end gap-3">
                        {/* Manage Event Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onManageEvent(event._id, event.width, event.height);
                          }}
                          disabled={!isSubscriptionActive}
                          className="bg-lime-600 hover:bg-lime-700 text-white px-5 h-10 font-medium disabled:bg-gray-300 disabled:text-gray-500"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Event
                        </Button>

                        {/* Additional Actions */}
                        {user?.plan?.permissions?.includes("qr.live") && (
                          <>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareClick(event);
                              }}
                              variant="outline"
                              className="border-gray-300 hover:bg-lime-50 hover:text-lime-700 hover:border-lime-600 px-5 h-10 font-medium"
                            >
                              <QrCode className="h-4 w-4 mr-2" />
                              Share & QR Code
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(event);
                              }}
                              variant="outline"
                              className="border-gray-300 hover:bg-lime-50 hover:text-lime-700 hover:border-lime-600 px-5 h-10 font-medium"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Event
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(event);
                              }}
                              variant="outline"
                              className="border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-600 px-5 h-10 font-medium"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Event
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

        {/* Mobile/Tablet Card Layout */}
        <div className="lg:hidden divide-y divide-gray-100">
          {!hasEvents || error ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900">
                  No events yet
                </p>
                <p className="text-sm mt-1 text-gray-600">
                  Click "Create New Event" to start
                </p>
              </div>
            </div>
          ) : (
            data.data.data.map((event) => (
              <div
                key={event._id}
                className="p-5 hover:bg-gray-50 transition-colors"
              >
                {/* Event Header */}
                <div
                  className="flex items-start gap-4 mb-4 cursor-pointer"
                  onClick={() => router.push(`/dashboard/details/${event._id}`)}
                >
                  {event.logo_path ? (
                    <Image
                      src={event.logo_path as string}
                      alt=""
                      width={64}
                      height={64}
                      className="rounded-lg w-16 h-16 object-cover border border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 flex-shrink-0">
                      <Plus className="h-7 w-7" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1.5">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-600">{event.date}</p>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-2.5 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-start gap-3 text-sm">
                    <span className="text-gray-600 font-medium w-20 flex-shrink-0">
                      Location:
                    </span>
                    <span className="text-gray-900">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 font-medium w-20 flex-shrink-0">
                      Size:
                    </span>
                    <span className="text-gray-900">
                      {event.width} × {event.height} meters
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onManageEvent(event._id, event.width, event.height);
                    }}
                    disabled={!isSubscriptionActive}
                    className="w-full bg-lime-600 hover:bg-lime-700 text-white h-11 font-medium text-base disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Manage Event
                  </Button>

                  {user?.plan?.permissions?.includes("qr.live") && (
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareClick(event);
                        }}
                        className="border-gray-300 hover:bg-lime-50 hover:text-lime-700 hover:border-lime-600 h-11 font-medium"
                      >
                        <QrCode className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Share & QR</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(event);
                        }}
                        className="border-gray-300 hover:bg-lime-50 hover:text-lime-700 hover:border-lime-600 h-11 font-medium"
                      >
                        <Edit className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(event);
                        }}
                        className="border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-600 h-11 font-medium"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination - Full Width */}
      {(data?.data?.metaData?.page ?? 0) > 1 && (
        <div className="flex justify-center mt-8 px-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-40"
                      : "hover:bg-lime-50 hover:text-lime-700 border-gray-300"
                  }
                />
              </PaginationItem>
              {Array.from(
                { length: data?.data?.metaData?.page ?? 0 },
                (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(i + 1);
                      }}
                      isActive={currentPage === i + 1}
                      className={
                        currentPage === i + 1
                          ? "bg-lime-600 text-white hover:bg-lime-700 font-medium"
                          : "hover:bg-lime-50 hover:text-lime-700 border-gray-300"
                      }
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < (data?.data?.metaData?.page ?? 0))
                      handlePageChange(currentPage + 1);
                  }}
                  className={
                    currentPage === (data?.data?.metaData?.page ?? 0)
                      ? "pointer-events-none opacity-40"
                      : "hover:bg-lime-50 hover:text-lime-700 border-gray-300"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Edit Event Details
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base pt-1">
                Update information for{" "}
                <strong className="text-gray-900">{editingEvent.name}</strong>
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
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-red-600 text-2xl">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <span>Delete This Event?</span>
            </DialogTitle>
            <DialogDescription className="text-gray-700 pt-4 text-base leading-relaxed">
              You are about to permanently delete{" "}
              <strong className="text-gray-900 font-semibold">
                &quot;{eventToDelete?.name}&quot;
              </strong>
              .
              <br />
              <br />
              <span className="text-red-600 font-medium">
                This action cannot be undone.
              </span>{" "}
              All event data will be permanently removed, including:
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 border border-red-100 rounded-lg p-4 my-2">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>All attendee information and registrations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>Event settings and configurations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>Shared links and QR codes will stop working</span>
              </li>
            </ul>
          </div>

          <DialogFooter className="gap-3 sm:gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmModalOpen(false)}
              className="flex-1 sm:flex-none border-gray-300 h-12 font-medium hover:bg-gray-50"
            >
              Keep Event
            </Button>
            <Button
              onClick={confirmDelete}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white h-12 font-medium"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Yes, Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share & QR Code Modal */}
      {sharingEvent && (
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
                <div className="w-12 h-12 rounded-full bg-lime-50 flex items-center justify-center flex-shrink-0">
                  <Share2 className="h-6 w-6 text-lime-600" />
                </div>
                <span>Share Event</span>
              </DialogTitle>
              <DialogDescription className="text-gray-700 text-base pt-1">
                Share{" "}
                <strong className="text-gray-900 font-semibold">
                  {sharingEvent.name}
                </strong>{" "}
                with your guests using the link or QR code below
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Shareable Link Section */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-lime-600" />
                  <Label
                    htmlFor="shareLink"
                    className="text-base font-semibold text-gray-900"
                  >
                    Event Link
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  Copy this link to share with attendees via email or messaging
                </p>
                <div className="flex gap-2">
                  <Input
                    id="shareLink"
                    readOnly
                    value={`${window.location.origin}/public-view/event/${sharingEvent._id}`}
                    className="text-sm flex-1 bg-white border-gray-300 h-12 font-mono"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    onClick={handleCopyLink}
                    className={`px-6 h-12 font-medium whitespace-nowrap transition-all ${
                      linkCopied
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-lime-600 hover:bg-lime-700"
                    } text-white`}
                  >
                    {linkCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  asChild
                  className="w-full border-gray-300 hover:bg-lime-50 hover:text-lime-700 hover:border-lime-600 h-11 font-medium"
                >
                  <a
                    href={`${window.location.origin}/public-view/event/${sharingEvent._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Preview Event Page
                  </a>
                </Button>
              </div>

              {/* QR Code Section */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-lime-600" />
                  <Label className="text-base font-semibold text-gray-900">
                    QR Code
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  Download and print this QR code for posters, invitations, or
                  easy mobile access
                </p>
                <div className="p-6 bg-white border-2 border-gray-200 flex justify-center rounded-lg">
                  <QRCodeCanvas
                    value={`${window.location.origin}/public-view/event/${sharingEvent._id}`}
                    ref={qrCodeCanvasRef}
                    size={260}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <Button
                  onClick={handleDownloadQrCode}
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white h-12 font-medium text-base"
                >
                  <QrCode className="h-5 w-5 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
