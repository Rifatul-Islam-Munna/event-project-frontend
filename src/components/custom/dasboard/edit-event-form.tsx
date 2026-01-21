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
import { CalendarIcon, Loader2, Upload, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Event } from "@/app/dashboard/page";
import { EventItem } from "@/@types/events-details";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEvent } from "@/actions/fetch-action";
import { toast } from "sonner";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";

type EditEventFormProps = {
  event: EventItem;
  onClose: () => void;
};

export function EditEventForm({ event, onClose }: EditEventFormProps) {
  const [eventName, setEventName] = useState(event.name);
  const [eventDate, setEventDate] = useState<Date | undefined>(
    parseISO(event.date),
  );
  const [eventLocation, setEventLocation] = useState(event.location);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [currentLogoPath, setCurrentLogoPath] = useState(event.logo_path);
  const [width, setWidth] = useState(event?.width ?? 0);
  const [height, setHeight] = useState(event?.height ?? 0);
  const [message, setMessage] = useState(event?.message ?? "");

  useEffect(() => {
    setEventName(event.name);
    setEventDate(parseISO(event.date));
    setEventLocation(event.location);
    setCurrentLogoPath(event.logo_path);
    setWidth(event?.width ?? 0);
    setHeight(event?.height ?? 0);
    setMessage(event?.message ?? "");
    setLogoFile(null);
    setLogoPreview(null);
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
        onClose();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!eventName || !eventDate || !eventLocation) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (width <= 0 || height <= 0) {
      toast.error("Please enter valid venue dimensions.");
      return;
    }

    const formdata = new FormData();
    formdata.append("name", eventName);
    formdata.append("date", format(eventDate, "yyyy-MM-dd"));
    formdata.append("id", event._id);
    formdata.append("location", eventLocation);
    formdata.append("width", width.toString());
    formdata.append("height", height.toString());
    if (logoFile) formdata.append("file", logoFile);
    if (message) formdata.append("message", message);

    mutate(formdata);
  };

  return (
    <div className="w-full max-w-[90%] mx-auto">
      {/* Scrollable Form Container */}
      <div className="max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Event Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="eventName"
              className="text-sm font-medium text-gray-900"
            >
              Event Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="eventName"
              type="text"
              placeholder="Annual Conference 2026"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="h-10 border-gray-300 focus:border-lime-600 focus:ring-lime-600"
            />
          </div>

          {/* Event Date */}
          <div className="space-y-1.5">
            <Label
              htmlFor="eventDate"
              className="text-sm font-medium text-gray-900"
            >
              Event Date <span className="text-red-600">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-10 justify-start text-left font-normal border-gray-300 hover:bg-gray-50 hover:border-lime-600",
                    !eventDate && "text-gray-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-600" />
                  {eventDate ? (
                    format(eventDate, "PPP")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 border-gray-200"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Event Location */}
          <div className="space-y-1.5">
            <Label
              htmlFor="eventLocation"
              className="text-sm font-medium text-gray-900"
            >
              Location <span className="text-red-600">*</span>
            </Label>
            <Input
              id="eventLocation"
              type="text"
              placeholder="Grand Ballroom, Downtown Center"
              required
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="h-10 border-gray-300 focus:border-lime-600 focus:ring-lime-600"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-5" />

          {/* Event Logo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Event Logo
            </Label>

            {/* Current Logo or Preview */}
            {logoPreview ? (
              <div className="flex items-center gap-3 p-3 bg-lime-50 border border-lime-300 rounded-lg">
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded border border-lime-400"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-lime-900 truncate">
                    {logoFile?.name}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeLogo}
                  className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : currentLogoPath ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Image
                  src={currentLogoPath as string}
                  alt="Current"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded border border-gray-300"
                />
                <p className="text-sm text-gray-600 flex-1 truncate">
                  {currentLogoPath.split("/").pop()}
                </p>
              </div>
            ) : null}

            {/* Upload Button */}
            <input
              id="logoFile"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <Label
              htmlFor="logoFile"
              className="flex items-center justify-center gap-2 h-10 px-4 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-lime-600 hover:bg-lime-50 transition-colors"
            >
              <Upload className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                {logoPreview ? "Change Logo" : "Upload Logo"}
              </span>
            </Label>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-5" />

          {/* Venue Dimensions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Venue Size (meters) <span className="text-red-600">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="number"
                  placeholder="Width"
                  required
                  min="1"
                  value={width > 0 ? width : ""}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="h-10 border-gray-300 focus:border-lime-600 focus:ring-lime-600"
                />
                <p className="text-xs text-gray-500 mt-1">Width</p>
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Height"
                  required
                  min="1"
                  value={height > 0 ? height : ""}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="h-10 border-gray-300 focus:border-lime-600 focus:ring-lime-600"
                />
                <p className="text-xs text-gray-500 mt-1">Height</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-5" />
          <div>
            <Textarea
              placeholder="Your Message for this Event (Optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-10 border-gray-300 focus:border-lime-600 focus:ring-lime-600"
            />
            <p className="text-xs text-gray-500 mt-1">Message (Optional)</p>
          </div>
        </form>
      </div>

      {/* Fixed Action Buttons */}
      <div className="flex items-center gap-3 pt-5 mt-5 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
          className="flex-1 h-11 border-gray-300 hover:bg-gray-50 font-medium"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 bg-lime-600 hover:bg-lime-700 text-white h-11 font-medium"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
