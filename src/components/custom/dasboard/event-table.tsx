"use client";

import { useState, useEffect, useRef, Ref } from "react"; // Import useRef
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
import type { Event } from "@/app/dashboard/page"; // Import the Event type
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
import qrcode from "qrcode"; // Import the qrcode library
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateEventForm } from "./create-event-from";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { useQuery } from "@tanstack/react-query";
import { getAllEvent } from "@/actions/fetch-action";
import { EventItem } from "@/@types/events-details";
import { User } from "@/@types/user-types";
import { getUserInfo } from "@/actions/auth";
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
  const qrCodeCanvasRef = useRef<HTMLCanvasElement | null>(null); // Ref for the QR code canvas

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEvents = events.slice(startIndex, endIndex);
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

  const handleShareClick = (event: EventItem) => {
    setSharingEvent(event);
    setIsShareModalOpen(true);
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeCanvasRef.current) return;
    const url = qrCodeCanvasRef.current.toDataURL("image/png");

    const a = document.createElement("a");
    a.href = url;
    a.download = `event-${"f"}-qrcode.png`;
    a.click();
  };

  const { data, error } = useQuery({
    queryKey: ["get-all-events", currentPage],
    queryFn: () => getAllEvent(currentPage, 10),
  });

  console.log(user);
  return (
    <Card className="border border-gray-200/10  bg-transparent p-6 shadow-none  ">
      <div className="flex items-center justify-between mb-6   w-full">
        <h3 className="text-2xl font-bold  text-blue-500">Your Events</h3>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className=" bg-gradient-to-br from-blue-400 to-blue-500 rounded-full text-primary-foreground hover:bg-primary/90 transition-colors  ">
              <Plus className="mr-2 h-4 w-4" /> Create New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-border bg-background">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Create New Event
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
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
      <div className="border border-border rounded-md overflow-hidden bg-background w-full max-w-[370px] sm:max-w-xl md:max-w-2xl lg:max-w-full ">
        <Table className=" w-full ">
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead className="text-foreground py-3">Logo</TableHead>
              <TableHead className="text-foreground py-3">Event Name</TableHead>
              <TableHead className="text-foreground py-3">Date</TableHead>
              <TableHead className="text-foreground py-3">Location</TableHead>

              <TableHead className="text-foreground text-center py-3">
                Manage
              </TableHead>
              <TableHead className="text-foreground  text-right py-3">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className=" overflow-x-auto bg-transparent">
            {data?.data?.data?.length === 0 || data?.error ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No events created yet.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.data?.map((event) => (
                <TableRow
                  key={event._id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="py-3">
                    {event.logo_path ? (
                      <Image
                        src={(event.logo_path as string) || "/placeholder.svg"}
                        alt={`${event.name} logo`}
                        width={40}
                        height={40}
                        className="rounded-full object-cover aspect-square border border-border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs border border-border">
                        No Logo
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground py-3">
                    {event?.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground py-3">
                    {event?.date}
                  </TableCell>
                  <TableCell className="text-muted-foreground py-3">
                    {event?.location}
                  </TableCell>

                  <TableCell className="text-center py-3">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        onManageEvent(event?._id, event?.name, event?.logo_path)
                      }
                      className=" text-primary-foreground hover:bg-primary/90 transition-colors bg-gradient-to-br from-blue-400 to-blue-500 rounded-full text-xs cursor-pointer "
                    >
                      Manage
                    </Button>
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-end py-3">
                    {user?.plan?.permissions?.includes("qr.live") ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleShareClick(event)}
                          className="text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                          aria-label={`Share ${event.name}`}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(event)}
                          className="text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                          aria-label={`Edit ${event.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(event)}
                          className="text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                          aria-label={`Delete ${event.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {(data?.data?.metaData?.page ?? 0) > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(currentPage - 1)}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-muted transition-colors"
                }
              />
            </PaginationItem>
            {Array.from({ length: data?.data?.metaData?.page ?? 0 }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={() => handlePageChange(i + 1)}
                  isActive={currentPage === i + 1}
                  className="hover:bg-muted transition-colors"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => handlePageChange(currentPage + 1)}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-muted transition-colors"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      {/* Edit Event Modal */}
      {editingEvent && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px] border-border bg-background">
            <DialogHeader>
              <DialogTitle className="text-foreground">Edit Event</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {
                  " Make changes to your event here. Click save when you're done."
                }
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
        <DialogContent className="sm:max-w-[425px] border-border bg-background">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" /> Confirm
              Deletion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete the event &quot;
              {eventToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmModalOpen(false)}
              className="border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-gray-50"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Share Event Modal */}
      {sharingEvent && (
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent className="sm:max-w-[425px] border-border bg-background">
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                <Share2 className="h-6 w-6 text-primary" /> Share Event:{" "}
                {sharingEvent?.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Share this link and QR code with your guests so they can find
                their seats.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="shareLink" className="text-foreground">
                  Shareable Link
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="shareLink"
                    readOnly
                    value={`${window.location.origin}/public-view/event/${sharingEvent._id}`}
                    className="border-border focus:ring-primary focus:border-primary"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `${window.location.origin}/public-view/event/${sharingEvent._id}`
                      )
                    }
                    className="border-border text-muted-foreground hover:bg-muted hover:text-primary"
                    aria-label="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                    className="border-border text-muted-foreground hover:bg-muted hover:text-primary bg-transparent"
                    aria-label="Open link"
                  >
                    <a
                      href={`${window.location.origin}/events/${sharingEvent.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <div className="grid gap-2 text-center">
                <Label className="text-foreground">QR Code</Label>
                <div className="p-4 bg-white rounded-md border border-border flex justify-center">
                  {/* Use a canvas element for QR code rendering */}
                  <QRCodeCanvas
                    value={`${window.location.origin}/public-view/event/${sharingEvent._id}`}
                    ref={qrCodeCanvasRef}
                    size={256}
                    level="H"
                    marginSize={4}
                    bgColor="#FFFFFF"
                    title={`${sharingEvent.name}-Event QR Code`}
                    fgColor="#000000"
                  />
                </div>
                <Button
                  onClick={handleDownloadQrCode}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
                >
                  Download QR Code
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsShareModalOpen(false)}
                className="border-border text-foreground hover:bg-muted transition-colors"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
