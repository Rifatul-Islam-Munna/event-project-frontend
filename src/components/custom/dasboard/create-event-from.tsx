"use client";

import type React from "react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
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
import { CalendarIcon, Loader2, MapPin, Upload, Check, X } from "lucide-react";
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
    <div className="h-[400px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [mapDrawerOpen, setMapDrawerOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const query = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["createEvent"],
    mutationFn: (payload: FormData) => postEvent(payload),
    onSuccess: (data) => {
      if (data.error) {
        return toast.error(data.error.message);
      }
      query.refetchQueries({ queryKey: ["get-all-events"], exact: false });
      toast.success("Event created successfully");
      onClose();
      // Reset form
      setEventName("");
      setEventDate(undefined);
      setEventLocation("");
      setLogoFile(null);
      setLogoPreview(null);
      setWidth(0);
      setHeight(0);
    },
    onError: (error) => {
      return toast.error(error.message);
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

  const handleLocationSelect = (locationName: string) => {
    setEventLocation(locationName);
    setMapDrawerOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!eventName || !eventDate || !eventLocation) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (width <= 0 || height <= 0) {
      toast.error("Please enter valid venue dimensions.");
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

    const formdata = new FormData();
    formdata.append("name", eventName);
    formdata.append("date", date);
    formdata.append("location", eventLocation);
    if (logoFile) formdata.append("file", logoFile);
    formdata.append("slug", slug);
    formdata.append("width", width.toString());
    formdata.append("height", height.toString());

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
            <div className="flex gap-2">
              <Input
                id="eventLocation"
                type="text"
                placeholder="Grand Ballroom, Downtown Center"
                required
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="h-10 border-gray-300 focus:border-lime-600 focus:ring-lime-600 flex-1"
              />

              {/* Map Drawer Trigger */}
              <Drawer open={mapDrawerOpen} onOpenChange={setMapDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-3 border-gray-300 hover:bg-lime-50 hover:border-lime-600 hover:text-lime-700"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[85vh]">
                  <DrawerHeader className="border-b border-gray-200">
                    <DrawerTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <div className="w-10 h-10 rounded-full bg-lime-50 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-lime-600" />
                      </div>
                      <span>Select Event Location</span>
                    </DrawerTitle>
                    <DrawerDescription className="text-gray-600 text-base pt-1">
                      Search for your venue or click on the map to pin the exact
                      location
                    </DrawerDescription>
                  </DrawerHeader>

                  <div className="px-4 pb-4 flex-1 overflow-hidden">
                    <MapLocationPicker
                      onLocationSelect={handleLocationSelect}
                      initialLocation={eventLocation}
                    />
                  </div>

                  <DrawerFooter className="border-t border-gray-200">
                    <DrawerClose asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 border-gray-300 hover:bg-gray-50 font-medium"
                      >
                        Close Map
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
            <p className="text-xs text-gray-500">
              Type address or click map icon to select location
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-5" />

          {/* Event Logo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Event Logo
            </Label>

            {/* Logo Preview */}
            {logoPreview && (
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
            )}

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
            <p className="text-xs text-gray-500">
              Optional: Square image recommended (500x500px)
            </p>
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
              Creating...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Create Event
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
