"use client";

import type React from "react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { format } from "date-fns";
import { CalendarIcon, Loader2, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserInfo } from "@/actions/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postEvent } from "@/actions/fetch-action";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const MapLocationPicker = dynamic(() => import("./MapLocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-slate-100 rounded-lg flex items-center justify-center">
      <div className="text-slate-500">Loading map...</div>
    </div>
  ),
});

type CreateEventFormProps = {
  onAddEvent: (event: {
    id: string;
    name: string;
    date: string;
    location: string;
    logoFile?: File | null;
  }) => void;
  onClose: () => void;
};

export function CreateEventForm({ onAddEvent, onClose }: CreateEventFormProps) {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [eventLocation, setEventLocation] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mapDrawerOpen, setMapDrawerOpen] = useState(false);
  const [width, setWidth] = useState(80);
  const [height, setHeight] = useState(80);

  const query = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["createEvent"],
    mutationFn: (payload: FormData) => postEvent(payload),
    onSuccess: (data) => {
      console.log("data", data);
      onClose();
      setEventName("");
      setEventDate(undefined);
      setEventLocation("");
      setLogoFile(null);
      if (data.error) {
        return toast.error(data.error.message);
      }
      query.refetchQueries({ queryKey: ["get-all-events"], exact: false });
      return toast.success("Event created successfully");
    },
    onError: (error) => {
      return toast.error(error.message);
    },
  });

  const handleLocationSelect = (locationName: string) => {
    setEventLocation(locationName);
    setMapDrawerOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!eventName || !eventDate || !eventLocation) {
      setMessage("Please fill in all required fields.");
      setIsSuccess(false);
      setIsSubmitting(false);
      return;
    }

    const name = eventName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const date = format(eventDate, "yyyy-MM-dd");
    const location = eventLocation
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const email = (await getUserInfo()).email.split("@")[0];
    const random = Math.floor(Math.random() * 7000) + 1;

    const slug = `${name}-${date}-${location}-${email}-${random}`;
    const newEvent = {
      id: uuidv4(),
      name: eventName,
      date: format(eventDate, "yyyy-MM-dd"),
      location: eventLocation,
      logoFile: logoFile,
      slug: slug,
      width: width,
      height: height,
    };

    const fromdata = new FormData();
    fromdata.append("name", newEvent.name);
    fromdata.append("date", newEvent.date);
    fromdata.append("location", newEvent.location);
    fromdata.append("file", newEvent.logoFile as File);
    fromdata.append("slug", newEvent.slug);
    fromdata.append("width", newEvent.width.toString());
    fromdata.append("height", newEvent.height.toString());

    mutate(fromdata);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="eventName" className="text-foreground">
          Event Name
        </Label>
        <Input
          id="eventName"
          name="eventName"
          type="text"
          placeholder="My Wedding Reception"
          required
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="border-border focus:ring-primary focus:border-primary"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="eventDate" className="text-foreground">
          Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal border-border",
                !eventDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-border bg-background">
            <Calendar
              mode="single"
              selected={eventDate}
              onSelect={setEventDate}
              initialFocus
              className="border-none"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="eventLocation" className="text-foreground">
          Location
        </Label>
        <div className="flex gap-2">
          <Input
            id="eventLocation"
            name="eventLocation"
            type="text"
            placeholder="Grand Ballroom or search on map..."
            required
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            className="border-border focus:ring-primary focus:border-primary flex-1"
          />

          {/* Map Drawer Trigger */}
          <Drawer open={mapDrawerOpen} onOpenChange={setMapDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="px-3 border-border hover:bg-muted"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
              <DrawerHeader>
                <DrawerTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Choose Event Location
                </DrawerTitle>
                <DrawerDescription>
                  Search for a location or click on the map to pin your event
                  venue
                </DrawerDescription>
              </DrawerHeader>

              <div className="px-4 pb-4 flex-1 overflow-hidden">
                <MapLocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={eventLocation}
                />
              </div>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
        <p className="text-xs text-muted-foreground">
          Click the map icon to search or pin location on map
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="logoFile" className="text-foreground">
          Event Logo (Upload Image)
        </Label>
        <Input
          id="logoFile"
          name="logoFile"
          type="file"
          accept="image/*"
          onChange={(e) =>
            setLogoFile(e.target.files ? e.target.files[0] : null)
          }
          className="border-border focus:ring-primary focus:border-primary file:text-primary file:bg-muted file:border-border file:hover:bg-muted/80"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="eventLocation" className="text-foreground">
          Venue Width (meter)
        </Label>
        <div className="flex gap-2">
          <Input
            id="eventLocation"
            name="eventLocation"
            type="text"
            placeholder="venue width in meter"
            required
            value={width > 0 ? width : ""}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="border-border focus:ring-primary focus:border-primary flex-1"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="eventLocation" className="text-foreground">
          Venue Height (meter)
        </Label>
        <div className="flex gap-2">
          <Input
            id="eventLocation"
            name="eventLocation"
            type="text"
            placeholder="venue height in meter"
            required
            value={height > 0 ? height : ""}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="border-border focus:ring-primary focus:border-primary flex-1"
          />
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button
          type="submit"
          className="w-full bg-gradient-to-br from-blue-400 to-blue-500 rounded-full text-primary-foreground hover:bg-primary/90"
          disabled={isPending}
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Create Event
        </Button>
      </DialogFooter>
    </form>
  );
}
