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
import { usePathname } from "next/navigation";
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

// ─── Timezones ────────────────────────────────────────────────────────────────
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

// ─── Limit Credit Pill ────────────────────────────────────────────────────────
function CreditPill({
  icon: Icon,
  label,
  value,
  color,
  isEmpty,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  isEmpty: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
        isEmpty ? "bg-slate-50 border-slate-200 text-slate-400" : color,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="text-xs opacity-75">{label}</span>
      <span
        className={cn(
          "ml-auto font-bold tabular-nums",
          isEmpty && "text-slate-400",
        )}
      >
        {isEmpty ? "—" : value}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function MessageSendCard() {
  const [localDateTime, setLocalDateTime] = useState<string>("");
  const [selectedTimezone, setSelectedTimezone] =
    useState<string>("Europe/London");
  const [open, setOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const pathName = usePathname();
  const eventId = pathName.split("/").pop() as string;
  const queryClient = useQueryClient();

  // ── Queries ───────────────────────────────────────────────────────────
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

  // ── Extracted limits ──────────────────────────────────────────────────
  const smsLimit = limitData?.message ?? 0;
  const whatsappLimit = limitData?.whatsapp ?? 0;
  const emailLimit = limitData?.email ?? 0;
  const flushCardCoupon = limitData?.flushCardCoupon ?? null;

  // ── Mutations ─────────────────────────────────────────────────────────
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

  // ── Derived ───────────────────────────────────────────────────────────
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
        cls: "bg-slate-100 text-slate-600 border-slate-200",
        icon: Clock,
      };
    if (data.isMessageSend && !hasPending)
      return {
        label: "All Sent",
        cls: "bg-lime-100 text-lime-700 border-lime-200",
        icon: CheckCircle2,
      };
    if (hasPending)
      return {
        label: "Partially Sent",
        cls: "bg-amber-100 text-amber-700 border-amber-200",
        icon: AlertCircle,
      };
    return {
      label: "Ready to Send",
      cls: "bg-blue-100 text-blue-700 border-blue-200",
      icon: Clock,
    };
  }, [data, hasPending]);

  const StatusIcon = statusConfig.icon;

  // ── Loading ───────────────────────────────────────────────────────────
  if (isPending)
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex items-center justify-center py-14">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-[3px] border-lime-200 border-t-lime-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading schedule...</p>
          </div>
        </CardContent>
      </Card>
    );

  if (!data)
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-14 gap-2">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">
            No message schedule found
          </p>
          <p className="text-xs text-slate-400">
            Place some guests first to activate messaging
          </p>
        </CardContent>
      </Card>
    );

  return (
    <>
      <Card className="border-slate-200 bg-white shadow-md rounded-2xl overflow-hidden">
        {/* ── Top accent ── */}
        <div className="h-1 w-full bg-gradient-to-r from-lime-500 to-lime-600" />

        {/* ── Header ── */}
        <CardHeader className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-lime-100 flex items-center justify-center">
                <CalendarClock className="h-4.5 w-4.5 text-lime-600" />
              </div>
              <div>
                <CardTitle className="text-base text-slate-900 leading-tight">
                  Message Schedule
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Sending status for this event
                </CardDescription>
              </div>
            </div>
            <Badge
              className={cn(
                "flex items-center gap-1 border text-xs font-medium px-2.5 py-1",
                statusConfig.cls,
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="px-5 py-4 space-y-4">
          {/* ── Available Credits ─────────────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Available Credits
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <CreditPill
                icon={MessageSquare}
                label="SMS"
                value={smsLimit}
                color="bg-blue-50 border-blue-200 text-blue-700"
                isEmpty={smsLimit === 0}
              />
              <CreditPill
                icon={Phone}
                label="WhatsApp"
                value={whatsappLimit}
                color="bg-green-50 border-green-200 text-green-700"
                isEmpty={whatsappLimit === 0}
              />
              <CreditPill
                icon={Mail}
                label="Email"
                value={emailLimit}
                color="bg-purple-50 border-purple-200 text-purple-700"
                isEmpty={emailLimit === 0}
              />

              {/* Flush Card Coupon */}
              <a
                href="https://flashback.camera/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200",
                  "group hover:shadow-md active:scale-[0.98]",
                  flushCardCoupon
                    ? "bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300",
                )}
              >
                {/* Left icon */}
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    flushCardCoupon ? "bg-orange-100" : "bg-slate-100",
                  )}
                >
                  <CreditCard
                    className={cn(
                      "h-4 w-4",
                      flushCardCoupon ? "text-orange-500" : "text-slate-400",
                    )}
                  />
                </div>

                {/* Text block */}
                <div className="flex flex-col min-w-0">
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      flushCardCoupon ? "text-orange-700" : "text-slate-500",
                    )}
                  >
                    Flush Card
                  </span>
                  <span
                    className={cn(
                      "font-mono font-bold text-xs tracking-wider truncate",
                      flushCardCoupon ? "text-orange-600" : "text-slate-400",
                    )}
                  >
                    {flushCardCoupon ?? "—"}
                  </span>
                </div>

                {/* Right — visit label + icon */}
                <div
                  className={cn(
                    "ml-auto flex items-center gap-1 text-xs font-semibold shrink-0",
                    "px-2 py-1 rounded-lg transition-colors duration-200",
                    flushCardCoupon
                      ? "bg-orange-100 text-orange-600 group-hover:bg-orange-200"
                      : "bg-slate-100 text-slate-400 group-hover:bg-slate-200",
                  )}
                >
                  Visit
                  <ExternalLink className="h-3 w-3" />
                </div>
              </a>
            </div>

            {/* No credits at all warning */}
            {smsLimit === 0 &&
              whatsappLimit === 0 &&
              emailLimit === 0 &&
              !flushCardCoupon && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  You have no credits. Purchase an add-on below to start
                  sending.
                </p>
              )}
          </div>

          <Separator />

          {/* ── Schedule info ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5" /> Scheduled for
              </span>
              <span className="font-semibold text-slate-800 text-xs">
                {formattedDisplayDate}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" /> All messages sent
              </span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  data.isMessageSend ? "text-lime-600" : "text-slate-500",
                )}
              >
                {data.isMessageSend ? "Yes ✓" : "No"}
              </span>
            </div>
          </div>

          {/* ── Pending breakdown ── */}
          <div
            className={cn(
              "rounded-xl border p-3 space-y-2.5",
              hasPending
                ? "bg-amber-50 border-amber-200"
                : "bg-lime-50 border-lime-200",
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-xs font-semibold",
                  hasPending ? "text-amber-700" : "text-lime-700",
                )}
              >
                {hasPending ? "Pending messages" : "No pending messages"}
              </span>
              {hasPending && (
                <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                  {totalPending} total
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "SMS",
                  value: data.numberOfNotSend?.sms ?? 0,
                  icon: MessageSquare,
                  color: "text-blue-600 bg-blue-50 border-blue-200",
                },
                {
                  label: "Mail",
                  value: data.numberOfNotSend?.mail ?? 0,
                  icon: Mail,
                  color: "text-purple-600 bg-purple-50 border-purple-200",
                },
                {
                  label: "WhatsApp",
                  value: data.numberOfNotSend?.whatsapp ?? 0,
                  icon: Phone,
                  color: "text-green-600 bg-green-50 border-green-200",
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg border py-2 px-1",
                    color,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-base font-bold leading-tight">
                    {value}
                  </span>
                  <span className="text-[10px] font-medium opacity-70">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <Separator />

        {/* ── Footer actions ── */}
        <CardFooter className="px-5 py-3 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 hidden sm:block">
            ID:{" "}
            <span className="font-mono">{String(data.event_id).slice(-8)}</span>
          </span>

          <div className="flex items-center gap-2 ml-auto">
            {/* ── Resend AlertDialog ── */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={resendMutation.isPending}
                  className="h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50 gap-1.5"
                >
                  {resendMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" /> Resend
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 text-amber-600" />
                    </div>
                    <AlertDialogTitle>Resend messages?</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-slate-600 leading-relaxed">
                    This will re-queue <strong>all pending messages</strong> —
                    SMS <strong>({data.numberOfNotSend?.sms ?? 0})</strong>,{" "}
                    Mail <strong>({data.numberOfNotSend?.mail ?? 0})</strong>,{" "}
                    WhatsApp{" "}
                    <strong>({data.numberOfNotSend?.whatsapp ?? 0})</strong>.
                    <br />
                    <br />
                    Recipients who already received a message{" "}
                    <strong>may receive it again</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => resendMutation.mutate()}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> Yes, resend all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* ── Update schedule ── */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-lime-600 hover:bg-lime-700 text-white gap-1.5"
                >
                  <CalendarClock className="h-3.5 w-3.5" /> Update schedule
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center">
                      <CalendarClock className="h-5 w-5 text-lime-600" />
                    </div>
                    <DialogTitle>Update starting date & time</DialogTitle>
                  </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="datetime"
                      className="text-slate-700 font-medium"
                    >
                      Starting at
                    </Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={localDateTime}
                      onChange={(e) => setLocalDateTime(e.target.value)}
                      className="h-11 border-slate-300 focus-visible:ring-lime-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Time zone
                    </Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-11 border-slate-300"
                        >
                          <span className="truncate">
                            {getSelectedLabel(selectedTimezone)}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[450px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search timezone..." />
                          <CommandList>
                            <CommandEmpty>No timezone found.</CommandEmpty>
                            {[
                              {
                                heading: "🇪🇺 Europe",
                                list: MAJOR_TIMEZONES.european,
                              },
                              {
                                heading: "🌎 Americas",
                                list: MAJOR_TIMEZONES.americas,
                              },
                              {
                                heading: "🌏 Asia",
                                list: MAJOR_TIMEZONES.asia,
                              },
                              {
                                heading: "🌍 Africa",
                                list: MAJOR_TIMEZONES.africa,
                              },
                              {
                                heading: "🌊 Oceania",
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
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedTimezone === tz.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {tz.label} {formatTimezone(tz.value)}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-slate-400">
                      Selected: {selectedTimezone}
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!localDateTime || updateMutation.isPending}
                    className="bg-lime-600 hover:bg-lime-700 text-white min-w-[110px]"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Saving...
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

      {/* ── Add-on cards below ── */}
      <AddOnCards />
    </>
  );
}
