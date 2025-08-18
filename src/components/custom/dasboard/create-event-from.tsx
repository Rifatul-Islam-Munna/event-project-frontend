"use client";

import type React from "react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { DialogFooter } from "@/components/ui/dialog"; // Only import DialogFooter
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming cn utility is available
import { getUserInfo } from "@/actions/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postEvent } from "@/actions/fetch-action";
import { toast } from "sonner";

type CreateEventFormProps = {
  onAddEvent: (event: {
    id: string;
    name: string;
    date: string;
    location: string;
    logoFile?: File | null; // Changed to File for upload
  }) => void;
  onClose: () => void; // Callback to close the modal
};

export function CreateEventForm({ onAddEvent, onClose }: CreateEventFormProps) {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [eventLocation, setEventLocation] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null); // State for the file object
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
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
      id: uuidv4(), // Generate a unique ID for client-side management
      name: eventName,
      date: format(eventDate, "yyyy-MM-dd"), // Format date to string
      location: eventLocation,
      logoFile: logoFile,
      slug: slug,
    };

    console.log("newEvent", newEvent);

    const fromdata = new FormData();
    fromdata.append("name", newEvent.name);
    fromdata.append("date", newEvent.date);
    fromdata.append("location", newEvent.location);
    fromdata.append("file", newEvent.logoFile as File);
    fromdata.append("slug", newEvent.slug);
    console.log("fromdata", fromdata.get("name"));

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
      <DialogFooter className="mt-4">
        <Button
          type="submit"
          className="w-full bg-gradient-to-br from-blue-400 to-blue-500 rounded-full text-primary-foreground hover:bg-primary/90"
          disabled={isPending}
        >
          {isPending && <Loader2 className=" w-4  h-4 animate-spin" />}Create
          Event
        </Button>
      </DialogFooter>
    </form>
  );
}
