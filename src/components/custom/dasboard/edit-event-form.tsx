"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Event } from "@/app/dashboard/page"; // Import the Event type
import { EventItem } from "@/@types/events-details";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEvent } from "@/actions/fetch-action";
import { toast } from "sonner";

type EditEventFormProps = {
  event: EventItem;

  onClose: () => void;
};

export function EditEventForm({
  event,

  onClose,
}: EditEventFormProps) {
  const [eventName, setEventName] = useState(event.name);
  const [eventDate, setEventDate] = useState<Date | undefined>(
    parseISO(event.date)
  );
  const [eventLocation, setEventLocation] = useState(event.location);
  const [logoFile, setLogoFile] = useState<File | null>(null); // For new file upload
  const [currentLogoPath, setCurrentLogoPath] = useState(event.logo_path); // To display current logo

  useEffect(() => {
    setEventName(event.name);
    setEventDate(parseISO(event.date));
    setEventLocation(event.location);
    setCurrentLogoPath(event.logo_path);
    setLogoFile(null); // Clear file input when event changes
  }, [event]);
  const query = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["updateEvent"],
    mutationFn: (payload: FormData) => updateEvent(payload),
    onSuccess: (data) => {
      query.refetchQueries({ queryKey: ["get-all-events"], exact: false });
      if (data.error) {
        toast.error(data.error.message);
      } else {
        toast.success("Event updated successfully");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!eventName || !eventDate || !eventLocation) {
      toast.success("Please fill in all required fields.");

      return;
    }

    const fromdata = new FormData();
    fromdata.append("name", eventName);
    fromdata.append("date", format(eventDate, "yyyy-MM-dd"));
    fromdata.append("id", event._id);
    fromdata.append("location", eventLocation);
    if (logoFile) fromdata.append("file", logoFile);
    mutate(fromdata);

    onClose();
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
        <Input
          id="eventLocation"
          name="eventLocation"
          type="text"
          placeholder="Grand Ballroom"
          required
          value={eventLocation}
          onChange={(e) => setEventLocation(e.target.value)}
          className="border-border focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="logoFile" className="text-foreground">
          Event Logo (Upload New Image)
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
        {currentLogoPath && !logoFile && (
          <p className="text-sm text-muted-foreground">
            Current: {currentLogoPath.split("/").pop()}
          </p>
        )}
        {logoFile && (
          <p className="text-sm text-muted-foreground">
            New file selected: {logoFile.name}
          </p>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
          Update Event
        </Button>
      </div>
    </form>
  );
}
