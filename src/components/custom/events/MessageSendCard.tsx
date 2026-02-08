"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
  getMessageService,
  updateMessageService,
} from "@/actions/vendor-category-actions";
import { format } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type MessageSend = {
  _id: string;
  event_id: string;
  numberOFSendMessageLimit?: number;
  startingDate?: string | Date;
  numberOfNotSend: {
    sms: number;
    mail: number;
    whatsapp: number;
  };
  isMessageSend: boolean;
  // No timeZone field in backend
};

// Curated list of major capital/country representative timezones
const MAJOR_TIMEZONES = {
  // European Timezones (Priority)
  european: [
    { value: "Europe/London", label: "London (United Kingdom)" },
    { value: "Europe/Paris", label: "Paris (France)" },
    { value: "Europe/Berlin", label: "Berlin (Germany)" },
    { value: "Europe/Madrid", label: "Madrid (Spain)" },
    { value: "Europe/Rome", label: "Rome (Italy)" },
    { value: "Europe/Amsterdam", label: "Amsterdam (Netherlands)" },
    { value: "Europe/Brussels", label: "Brussels (Belgium)" },
    { value: "Europe/Vienna", label: "Vienna (Austria)" },
    { value: "Europe/Stockholm", label: "Stockholm (Sweden)" },
    { value: "Europe/Copenhagen", label: "Copenhagen (Denmark)" },
    { value: "Europe/Oslo", label: "Oslo (Norway)" },
    { value: "Europe/Helsinki", label: "Helsinki (Finland)" },
    { value: "Europe/Warsaw", label: "Warsaw (Poland)" },
    { value: "Europe/Prague", label: "Prague (Czech Republic)" },
    { value: "Europe/Budapest", label: "Budapest (Hungary)" },
    { value: "Europe/Bucharest", label: "Bucharest (Romania)" },
    { value: "Europe/Athens", label: "Athens (Greece)" },
    { value: "Europe/Istanbul", label: "Istanbul (Turkey)" },
    { value: "Europe/Dublin", label: "Dublin (Ireland)" },
    { value: "Europe/Lisbon", label: "Lisbon (Portugal)" },
    { value: "Europe/Zurich", label: "Zurich (Switzerland)" },
    { value: "Europe/Moscow", label: "Moscow (Russia)" },
    { value: "Europe/Kiev", label: "Kyiv (Ukraine)" },
  ],
  // Americas
  americas: [
    { value: "America/New_York", label: "New York (USA Eastern)" },
    { value: "America/Chicago", label: "Chicago (USA Central)" },
    { value: "America/Denver", label: "Denver (USA Mountain)" },
    { value: "America/Los_Angeles", label: "Los Angeles (USA Pacific)" },
    { value: "America/Toronto", label: "Toronto (Canada)" },
    { value: "America/Vancouver", label: "Vancouver (Canada)" },
    { value: "America/Mexico_City", label: "Mexico City (Mexico)" },
    { value: "America/Bogota", label: "Bogota (Colombia)" },
    { value: "America/Lima", label: "Lima (Peru)" },
    { value: "America/Santiago", label: "Santiago (Chile)" },
    { value: "America/Buenos_Aires", label: "Buenos Aires (Argentina)" },
    { value: "America/Sao_Paulo", label: "São Paulo (Brazil)" },
    { value: "America/Caracas", label: "Caracas (Venezuela)" },
    { value: "America/Panama", label: "Panama City (Panama)" },
    { value: "America/Havana", label: "Havana (Cuba)" },
  ],
  // Asia
  asia: [
    { value: "Asia/Dubai", label: "Dubai (UAE)" },
    { value: "Asia/Riyadh", label: "Riyadh (Saudi Arabia)" },
    { value: "Asia/Tehran", label: "Tehran (Iran)" },
    { value: "Asia/Karachi", label: "Karachi (Pakistan)" },
    { value: "Asia/Kolkata", label: "Delhi/Mumbai (India)" },
    { value: "Asia/Dhaka", label: "Dhaka (Bangladesh)" },
    { value: "Asia/Kathmandu", label: "Kathmandu (Nepal)" },
    { value: "Asia/Colombo", label: "Colombo (Sri Lanka)" },
    { value: "Asia/Bangkok", label: "Bangkok (Thailand)" },
    { value: "Asia/Jakarta", label: "Jakarta (Indonesia)" },
    { value: "Asia/Singapore", label: "Singapore" },
    { value: "Asia/Kuala_Lumpur", label: "Kuala Lumpur (Malaysia)" },
    { value: "Asia/Manila", label: "Manila (Philippines)" },
    { value: "Asia/Shanghai", label: "Beijing/Shanghai (China)" },
    { value: "Asia/Hong_Kong", label: "Hong Kong" },
    { value: "Asia/Taipei", label: "Taipei (Taiwan)" },
    { value: "Asia/Seoul", label: "Seoul (South Korea)" },
    { value: "Asia/Tokyo", label: "Tokyo (Japan)" },
    { value: "Asia/Ho_Chi_Minh", label: "Ho Chi Minh (Vietnam)" },
  ],
  // Africa
  africa: [
    { value: "Africa/Cairo", label: "Cairo (Egypt)" },
    { value: "Africa/Lagos", label: "Lagos (Nigeria)" },
    { value: "Africa/Nairobi", label: "Nairobi (Kenya)" },
    { value: "Africa/Johannesburg", label: "Johannesburg (South Africa)" },
    { value: "Africa/Casablanca", label: "Casablanca (Morocco)" },
    { value: "Africa/Algiers", label: "Algiers (Algeria)" },
    { value: "Africa/Accra", label: "Accra (Ghana)" },
  ],
  // Oceania
  oceania: [
    { value: "Australia/Sydney", label: "Sydney (Australia)" },
    { value: "Australia/Melbourne", label: "Melbourne (Australia)" },
    { value: "Australia/Perth", label: "Perth (Australia)" },
    { value: "Pacific/Auckland", label: "Auckland (New Zealand)" },
    { value: "Pacific/Fiji", label: "Fiji" },
    { value: "Pacific/Honolulu", label: "Honolulu (Hawaii)" },
  ],
};

// Format timezone with GMT offset
const formatTimezone = (tz: string) => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offset =
      parts.find((part) => part.type === "timeZoneName")?.value || "";
    return `${offset}`;
  } catch {
    return "";
  }
};

export function MessageSendCard() {
  const [localDateTime, setLocalDateTime] = useState<string>("");
  const [selectedTimezone, setSelectedTimezone] =
    useState<string>("Europe/London");
  const [open, setOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const pathName = usePathname();
  const eventId = pathName.split("/").pop() as string;
  const queryClient = useQueryClient();

  const {
    data: response,
    isPending,
    error,
  } = useQuery({
    queryKey: ["message-send", eventId],
    queryFn: () => getMessageService(eventId),
    enabled: !!eventId,
  });

  const data = response?.data;

  // Update mutation - ONLY sends date as ISO string, no timezone
  const updateMutation = useMutation({
    mutationFn: async (dateISO: string) => {
      // Only send the ISO date string to backend
      return await updateMessageService(eventId, dateISO);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-send", eventId] });
      setIsDialogOpen(false);
    },
  });

  // Initialize localDateTime when data loads
  // Convert UTC date from backend to user's selected timezone for display
  useEffect(() => {
    if (data?.startingDate) {
      // Get browser's timezone as default
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setSelectedTimezone(browserTimezone);

      // Convert UTC date to browser timezone for display
      const utcDate = new Date(data.startingDate);
      const zonedDate = toZonedTime(utcDate, browserTimezone);

      // Format for datetime-local input
      const formatted = format(zonedDate, "yyyy-MM-dd'T'HH:mm");
      setLocalDateTime(formatted);
    }
  }, [data?.startingDate]);

  const hasPending = useMemo(() => {
    if (!data) return false;
    const n = data.numberOfNotSend ?? { sms: 0, mail: 0, whatsapp: 0 };
    return (n.sms ?? 0) > 0 || (n.mail ?? 0) > 0 || (n.whatsapp ?? 0) > 0;
  }, [data]);

  const totalPending = useMemo(() => {
    if (!data) return 0;
    const n = data.numberOfNotSend ?? { sms: 0, mail: 0, whatsapp: 0 };
    return (n.sms ?? 0) + (n.mail ?? 0) + (n.whatsapp ?? 0);
  }, [data]);

  const statusLabel = useMemo(() => {
    if (!data) return "Loading...";
    if (data.isMessageSend && !hasPending) return "All messages sent";
    if (hasPending) return "Some messages not sent";
    return "Ready to send";
  }, [data, hasPending]);

  const statusColorClass = useMemo(() => {
    if (!data) return "bg-lime-700 text-lime-50";
    if (data.isMessageSend && !hasPending) return "bg-lime-600 text-lime-50";
    if (hasPending) return "bg-lime-500 text-lime-950";
    return "bg-lime-700 text-lime-50";
  }, [data, hasPending]);

  const handleSave = async () => {
    if (!localDateTime) return;

    // Convert the user's selected datetime (in their chosen timezone) to UTC
    // Example: "2026-02-10T15:00" in "Asia/Dhaka" timezone
    const utcDate = fromZonedTime(localDateTime, selectedTimezone);

    // Convert to ISO string and send ONLY the date to backend (no timezone)
    // Example result: "2026-02-10T09:00:00.000Z"
    await updateMutation.mutateAsync(utcDate.toISOString());
  };

  // Format display date - convert UTC from backend to browser timezone
  const formattedDisplayDate = useMemo(() => {
    if (!data?.startingDate) return "Not set";

    // Get browser timezone for display
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const utcDate = new Date(data.startingDate);
    const zonedDate = toZonedTime(utcDate, browserTimezone);

    return `${format(zonedDate, "PPp")}`;
  }, [data?.startingDate]);

  // Get selected timezone display label
  const getSelectedLabel = (tzValue: string) => {
    const allTimezones = [
      ...MAJOR_TIMEZONES.european,
      ...MAJOR_TIMEZONES.americas,
      ...MAJOR_TIMEZONES.asia,
      ...MAJOR_TIMEZONES.africa,
      ...MAJOR_TIMEZONES.oceania,
    ];
    const tzInfo = allTimezones.find((tz) => tz.value === tzValue);
    const offset = formatTimezone(tzValue);
    return tzInfo ? `${tzInfo.label} ${offset}` : tzValue;
  };

  // Loading state
  if (isPending) {
    return (
      <Card className="border-lime-500/70 shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!data) {
    return (
      <Card className="border-lime-500/70 shadow-sm">
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">
            No message schedule found for this event, Place some guests first
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-lime-500/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-lg">Message schedule</CardTitle>
          <CardDescription>
            Control sending status for this event.
          </CardDescription>
        </div>

        <Badge className={`${statusColorClass} font-medium`}>
          {statusLabel}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Starting date & time</span>
            <span className="font-medium text-right max-w-[60%]">
              {formattedDisplayDate}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">All message send</span>
            <span className="font-medium">
              {data?.isMessageSend ? "Yes" : "No"}
            </span>
          </div>
        </div>

        <div className="rounded-md bg-lime-50 px-3 py-2 text-sm text-lime-900">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Not sent</span>
            <span className="font-semibold">Total: {totalPending}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-3">
            <span>SMS: {data.numberOfNotSend?.sms ?? 0}</span>
            <span>Mail: {data.numberOfNotSend?.mail ?? 0}</span>
            <span>WhatsApp: {data.numberOfNotSend?.whatsapp ?? 0}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Event ID: {data.event_id}
        </span>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-lime-600 hover:bg-lime-700 text-lime-50"
              size="sm"
            >
              Update date & time
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update starting date & time</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="datetime">Starting at</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={localDateTime}
                  onChange={(e) => setLocalDateTime(e.target.value)}
                  className="border-lime-500/60 focus-visible:ring-lime-600"
                />
              </div>

              <div className="space-y-2">
                <Label>Time zone</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between border-lime-500/60 focus-visible:ring-lime-600"
                    >
                      {selectedTimezone
                        ? getSelectedLabel(selectedTimezone)
                        : "Select timezone..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[450px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search timezone..." />
                      <CommandList>
                        <CommandEmpty>No timezone found.</CommandEmpty>

                        <CommandGroup heading="🇪🇺 European Timezones">
                          {MAJOR_TIMEZONES.european.map((timezone) => (
                            <CommandItem
                              key={timezone.value}
                              value={`${timezone.label} ${timezone.value}`}
                              onSelect={() => {
                                setSelectedTimezone(timezone.value);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedTimezone === timezone.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {timezone.label} {formatTimezone(timezone.value)}
                            </CommandItem>
                          ))}
                        </CommandGroup>

                        <CommandGroup heading="🌎 Americas">
                          {MAJOR_TIMEZONES.americas.map((timezone) => (
                            <CommandItem
                              key={timezone.value}
                              value={`${timezone.label} ${timezone.value}`}
                              onSelect={() => {
                                setSelectedTimezone(timezone.value);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedTimezone === timezone.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {timezone.label} {formatTimezone(timezone.value)}
                            </CommandItem>
                          ))}
                        </CommandGroup>

                        <CommandGroup heading="🌏 Asia">
                          {MAJOR_TIMEZONES.asia.map((timezone) => (
                            <CommandItem
                              key={timezone.value}
                              value={`${timezone.label} ${timezone.value}`}
                              onSelect={() => {
                                setSelectedTimezone(timezone.value);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedTimezone === timezone.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {timezone.label} {formatTimezone(timezone.value)}
                            </CommandItem>
                          ))}
                        </CommandGroup>

                        <CommandGroup heading="🌍 Africa">
                          {MAJOR_TIMEZONES.africa.map((timezone) => (
                            <CommandItem
                              key={timezone.value}
                              value={`${timezone.label} ${timezone.value}`}
                              onSelect={() => {
                                setSelectedTimezone(timezone.value);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedTimezone === timezone.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {timezone.label} {formatTimezone(timezone.value)}
                            </CommandItem>
                          ))}
                        </CommandGroup>

                        <CommandGroup heading="🌊 Oceania">
                          {MAJOR_TIMEZONES.oceania.map((timezone) => (
                            <CommandItem
                              key={timezone.value}
                              value={`${timezone.label} ${timezone.value}`}
                              onSelect={() => {
                                setSelectedTimezone(timezone.value);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedTimezone === timezone.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {timezone.label} {formatTimezone(timezone.value)}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedTimezone}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleSave}
                disabled={!localDateTime || updateMutation.isPending}
                className="bg-lime-700 hover:bg-lime-800 text-lime-50"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
