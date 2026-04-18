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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  getMessageService,
  getMyLimit,
  RequestForResend,
  updateMessageService as updateMessageServiceAction,
} from "@/actions/vendor-category-actions";
import { format } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import {
  Loader2,
  Check,
  ChevronsUpDown,
  MessageSquare,
  Mail,
  Phone,
  RefreshCw,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Wallet,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AddOnCards from "../common/AddOnCards";

export type MessageSend = {
  _id: string;
  event_id: string;
  startingDate?: string | Date;
  numberOfNotSend: { sms: number; mail: number; whatsapp: number };
  isMessageSend: boolean;
};

// ─── Timezones ──────────────────────────────────────────────────────────────
const MAJOR_TIMEZONES = {
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
  africa: [
    { value: "Africa/Cairo", label: "Cairo (Egypt)" },
    { value: "Africa/Lagos", label: "Lagos (Nigeria)" },
    { value: "Africa/Nairobi", label: "Nairobi (Kenya)" },
    { value: "Africa/Johannesburg", label: "Johannesburg (South Africa)" },
    { value: "Africa/Casablanca", label: "Casablanca (Morocco)" },
    { value: "Africa/Algiers", label: "Algiers (Algeria)" },
    { value: "Africa/Accra", label: "Accra (Ghana)" },
  ],
  oceania: [
    { value: "Australia/Sydney", label: "Sydney (Australia)" },
    { value: "Australia/Melbourne", label: "Melbourne (Australia)" },
    { value: "Australia/Perth", label: "Perth (Australia)" },
    { value: "Pacific/Auckland", label: "Auckland (New Zealand)" },
    { value: "Pacific/Fiji", label: "Fiji" },
    { value: "Pacific/Honolulu", label: "Honolulu (Hawaii)" },
  ],
};

const formatTimezone = (tz: string) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value || "";
  } catch {
    return "";
  }
};

// ─── Credit Row ─────────────────────────────────────────────────────────────
function CreditRow({
  icon: Icon,
  label,
  value,
  isEmpty,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  isEmpty: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <span
        className={cn(
          "text-xs font-semibold tabular-nums",
          isEmpty ? "text-zinc-300" : "text-zinc-800",
        )}
      >
        {isEmpty ? "\u2014" : value}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function MessageSendCard() {
  const [localDateTime, setLocalDateTime] = useState<string>("");
  const [selectedTimezone, setSelectedTimezone] =
    useState<string>("Europe/London");
  const [open, setOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const params = useParams<{ id: string }>();
  const eventId = params.id;
  const queryClient = useQueryClient();

  const {
    data: response,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["message-send", eventId],
    queryFn: () => getMessageService(eventId),
    enabled: !!eventId,
  });

  const { data: userLimitRes } = useQuery({
    queryKey: ["get-user-limit"],
    queryFn: () => getMyLimit(),
  });

  const data = response?.data;
  const limitData = userLimitRes?.data;

  const smsLimit = limitData?.message ?? 0;
  const whatsappLimit = limitData?.whatsapp ?? 0;
  const emailLimit = limitData?.email ?? 0;
  const flushCardCoupon = limitData?.flushCardCoupon ?? null;

  const resendMutation = useMutation({
    mutationFn: () => RequestForResend(eventId),
    onSuccess: () => {
      toast.success("Resend request submitted!");
      refetch();
    },
    onError: () => toast.error("Failed to submit resend request."),
  });

  const updateMutation = useMutation({
    mutationFn: async (dateISO: string) =>
      await updateMessageServiceAction(eventId, dateISO),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-send", eventId] });
      setIsDialogOpen(false);
      toast.success("Schedule updated successfully!");
    },
    onError: () => toast.error("Failed to update schedule."),
  });

  useEffect(() => {
    if (data?.startingDate) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setSelectedTimezone(tz);
      setLocalDateTime(
        format(
          toZonedTime(new Date(data.startingDate), tz),
          "yyyy-MM-dd'T'HH:mm",
        ),
      );
    }
  }, [data?.startingDate]);

  const hasPending = useMemo(() => {
    if (!data) return false;
    const n = data.numberOfNotSend ?? {};
    return (n.sms ?? 0) > 0 || (n.mail ?? 0) > 0 || (n.whatsapp ?? 0) > 0;
  }, [data]);

  const totalPending = useMemo(() => {
    if (!data) return 0;
    const n = data.numberOfNotSend ?? {};
    return (n.sms ?? 0) + (n.mail ?? 0) + (n.whatsapp ?? 0);
  }, [data]);

  const formattedDisplayDate = useMemo(() => {
    if (!data?.startingDate) return "Not set";
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return format(toZonedTime(new Date(data.startingDate), tz), "PPp");
  }, [data?.startingDate]);

  const getSelectedLabel = (tzValue: string) => {
    const all = Object.values(MAJOR_TIMEZONES).flat();
    const tz = all.find((t) => t.value === tzValue);
    return tz ? `${tz.label} ${formatTimezone(tzValue)}` : tzValue;
  };

  const handleSave = async () => {
    if (!localDateTime) return;
    await updateMutation.mutateAsync(
      fromZonedTime(localDateTime, selectedTimezone).toISOString(),
    );
  };

  const statusConfig = useMemo(() => {
    if (!data)
      return {
        label: "Loading",
        cls: "bg-zinc-100 text-zinc-500 border-zinc-200",
        icon: Clock,
      };
    if (data.isMessageSend && !hasPending)
      return {
        label: "All Sent",
        cls: "bg-lime-50 text-lime-700 border-lime-200",
        icon: CheckCircle2,
      };
    if (hasPending)
      return {
        label: "Partial",
        cls: "bg-zinc-100 text-zinc-600 border-zinc-200",
        icon: AlertCircle,
      };
    return {
      label: "Scheduled",
      cls: "bg-zinc-100 text-zinc-600 border-zinc-200",
      icon: Clock,
    };
  }, [data, hasPending]);

  const StatusIcon = statusConfig.icon;

  if (isPending)
    return (
      <Card className="border-zinc-200 shadow-sm rounded-xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-7 h-7 border-2 border-zinc-200 border-t-lime-500 rounded-full animate-spin" />
            <p className="text-xs text-zinc-400">Loading schedule\u2026</p>
          </div>
        </CardContent>
      </Card>
    );

  if (!data)
    return (
      <Card className="border-zinc-200 shadow-sm rounded-xl">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-2">
          <MessageSquare className="h-8 w-8 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-500">No schedule found</p>
          <p className="text-xs text-zinc-400">
            Add guests to activate messaging
          </p>
        </CardContent>
      </Card>
    );

  return (
    <>
      <Card className="border-zinc-200 bg-white shadow-sm rounded-xl overflow-hidden">
        {/* Top lime accent line */}
        <div className="h-[3px] w-full bg-lime-500" />

        {/* Header */}
        <CardHeader className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CalendarClock className="h-4 w-4 text-lime-600" />
              <div>
                <CardTitle className="text-sm font-semibold text-zinc-900">
                  Message Schedule
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Sending status for this event
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md",
                statusConfig.cls,
              )}
            >
              <StatusIcon className="h-2.5 w-2.5" />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <Separator className="bg-zinc-100" />

        <CardContent className="px-5 py-4 space-y-4">
          {/* Credits */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Wallet className="h-3 w-3 text-zinc-400" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Available Credits
              </span>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-0.5 divide-y divide-zinc-100">
              <CreditRow
                icon={MessageSquare}
                label="SMS"
                value={smsLimit}
                isEmpty={smsLimit === 0}
              />
              <CreditRow
                icon={Phone}
                label="WhatsApp"
                value={whatsappLimit}
                isEmpty={whatsappLimit === 0}
              />
              <CreditRow
                icon={Mail}
                label="Email"
                value={emailLimit}
                isEmpty={emailLimit === 0}
              />

              {/* Flush Card */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 text-zinc-500">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span className="text-xs">Flush Card</span>
                </div>
                <a
                  href="https://flashback.camera/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-1 text-xs font-semibold transition-colors",
                    flushCardCoupon
                      ? "text-lime-700 hover:text-lime-800"
                      : "text-zinc-300 pointer-events-none",
                  )}
                >
                  {flushCardCoupon ?? "\u2014"}
                  {flushCardCoupon && <ExternalLink className="h-2.5 w-2.5" />}
                </a>
              </div>
            </div>

            {smsLimit === 0 &&
              whatsappLimit === 0 &&
              emailLimit === 0 &&
              !flushCardCoupon && (
                <p className="mt-2 text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3 shrink-0 text-zinc-400" />
                  No credits available. Purchase an add-on below.
                </p>
              )}
          </div>

          <Separator className="bg-zinc-100" />

          {/* Schedule info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Clock className="h-3 w-3" /> Scheduled for
              </span>
              <span className="text-xs font-medium text-zinc-700">
                {formattedDisplayDate}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <CheckCircle2 className="h-3 w-3" /> All sent
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  data.isMessageSend ? "text-lime-600" : "text-zinc-400",
                )}
              >
                {data.isMessageSend ? "Yes" : "No"}
              </span>
            </div>
          </div>

          {/* Pending breakdown */}
          <div
            className={cn(
              "rounded-lg border px-3 py-2.5",
              hasPending
                ? "bg-zinc-50 border-zinc-200"
                : "bg-lime-50 border-lime-100",
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  hasPending ? "text-zinc-600" : "text-lime-700",
                )}
              >
                {hasPending ? "Pending messages" : "No pending messages"}
              </span>
              {hasPending && (
                <span className="text-[10px] font-bold bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded-full">
                  {totalPending}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                {
                  label: "SMS",
                  value: data.numberOfNotSend?.sms ?? 0,
                  icon: MessageSquare,
                },
                {
                  label: "Mail",
                  value: data.numberOfNotSend?.mail ?? 0,
                  icon: Mail,
                },
                {
                  label: "WhatsApp",
                  value: data.numberOfNotSend?.whatsapp ?? 0,
                  icon: Phone,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-0.5 bg-white border border-zinc-100 rounded-md py-2"
                >
                  <Icon className="h-3 w-3 text-zinc-400" />
                  <span
                    className={cn(
                      "text-sm font-bold leading-tight tabular-nums",
                      value > 0 ? "text-zinc-800" : "text-zinc-300",
                    )}
                  >
                    {value}
                  </span>
                  <span className="text-[10px] text-zinc-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <Separator className="bg-zinc-100" />

        {/* Footer */}
        <CardFooter className="px-5 py-3 flex items-center justify-between gap-2">
          <span className="text-[10px] text-zinc-300 font-mono hidden sm:block">
            {String(data.event_id).slice(-8)}
          </span>

          <div className="flex items-center gap-2 ml-auto">
            {/* Resend */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={resendMutation.isPending}
                  className="h-8 text-xs border-zinc-200 text-zinc-600 hover:bg-zinc-50 gap-1.5"
                >
                  {resendMutation.isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> Sending\u2026
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" /> Resend
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-9 w-9 rounded-lg bg-zinc-100 flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 text-zinc-500" />
                    </div>
                    <AlertDialogTitle className="text-sm font-semibold text-zinc-900">
                      Resend messages?
                    </AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-sm text-zinc-500 leading-relaxed">
                    This will re-queue all pending messages \u2014 SMS{" "}
                    <strong className="text-zinc-700">
                      ({data.numberOfNotSend?.sms ?? 0})
                    </strong>
                    , Mail{" "}
                    <strong className="text-zinc-700">
                      ({data.numberOfNotSend?.mail ?? 0})
                    </strong>
                    , WhatsApp{" "}
                    <strong className="text-zinc-700">
                      ({data.numberOfNotSend?.whatsapp ?? 0})
                    </strong>
                    . Recipients who already received a message may receive it
                    again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-xs h-8">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => resendMutation.mutate()}
                    className="h-8 text-xs bg-zinc-900 hover:bg-zinc-700 text-white"
                  >
                    <RefreshCw className="h-3 w-3 mr-1.5" /> Yes, resend all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Update schedule */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-lime-600 hover:bg-lime-700 text-white gap-1.5"
                >
                  <CalendarClock className="h-3 w-3" /> Update Schedule
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-lime-50 border border-lime-100 flex items-center justify-center">
                      <CalendarClock className="h-4 w-4 text-lime-600" />
                    </div>
                    <DialogTitle className="text-sm font-semibold text-zinc-900">
                      Update starting date & time
                    </DialogTitle>
                  </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="datetime"
                      className="text-xs font-medium text-zinc-600"
                    >
                      Starting at
                    </Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={localDateTime}
                      onChange={(e) => setLocalDateTime(e.target.value)}
                      className="h-9 text-sm border-zinc-200 focus-visible:ring-lime-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-zinc-600">
                      Time zone
                    </Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-9 text-sm border-zinc-200 font-normal"
                        >
                          <span className="truncate text-xs">
                            {getSelectedLabel(selectedTimezone)}
                          </span>
                          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-40" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[440px] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search timezone\u2026"
                            className="text-sm"
                          />
                          <CommandList>
                            <CommandEmpty className="text-xs text-zinc-400 py-4 text-center">
                              No timezone found.
                            </CommandEmpty>
                            {[
                              {
                                heading: "Europe",
                                list: MAJOR_TIMEZONES.european,
                              },
                              {
                                heading: "Americas",
                                list: MAJOR_TIMEZONES.americas,
                              },
                              { heading: "Asia", list: MAJOR_TIMEZONES.asia },
                              {
                                heading: "Africa",
                                list: MAJOR_TIMEZONES.africa,
                              },
                              {
                                heading: "Oceania",
                                list: MAJOR_TIMEZONES.oceania,
                              },
                            ].map(({ heading, list }) => (
                              <CommandGroup key={heading} heading={heading}>
                                {list.map((tz) => (
                                  <CommandItem
                                    key={tz.value}
                                    value={`${tz.label} ${tz.value}`}
                                    onSelect={() => {
                                      setSelectedTimezone(tz.value);
                                      setOpen(false);
                                    }}
                                    className="text-xs"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-3.5 w-3.5",
                                        selectedTimezone === tz.value
                                          ? "opacity-100 text-lime-600"
                                          : "opacity-0",
                                      )}
                                    />
                                    {tz.label}{" "}
                                    <span className="text-zinc-400 ml-1">
                                      {formatTimezone(tz.value)}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <p className="text-[10px] text-zinc-400">
                      {selectedTimezone}
                    </p>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDialogOpen(false)}
                    className="h-8 text-xs border-zinc-200 text-zinc-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!localDateTime || updateMutation.isPending}
                    className="h-8 text-xs bg-lime-600 hover:bg-lime-700 text-white min-w-[100px]"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />{" "}
                        Saving\u2026
                      </>
                    ) : (
                      "Save schedule"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardFooter>
      </Card>

      <AddOnCards />
    </>
  );
}
