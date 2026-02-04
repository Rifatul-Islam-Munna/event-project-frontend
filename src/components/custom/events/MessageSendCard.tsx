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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
  getMessageService,
  updateMessageService,
} from "@/actions/vendor-category-actions";
import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";

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
};

export function MessageSendCard() {
  const [localDateTime, setLocalDateTime] = useState<string>("");
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

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (newDate: Date) => {
      return await updateMessageService(eventId, newDate.toISOString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-send", eventId] });
      setIsDialogOpen(false);
    },
  });

  // Initialize localDateTime when data loads
  useEffect(() => {
    if (data?.startingDate) {
      const d = new Date(data.startingDate);
      // Format for datetime-local input: "YYYY-MM-DDTHH:mm"
      const formatted = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
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
    const newDate = new Date(localDateTime);
    await updateMutation.mutateAsync(newDate);
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

  /* // Error state
  if (!isPending || error) {
    return (
      <Card className="border-red-500/70 shadow-sm">
        <CardContent className="py-6">
          <p className="text-sm text-red-600">
            Failed to load message schedule data. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  } */

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
            <span className="font-medium">
              {data.startingDate
                ? format(parseISO(data.startingDate.toString()), "PPp")
                : "Not set"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">All message send</span>
            <span className="font-medium">
              {data?.isMessageSend ? "Yes" : "No"}
            </span>
          </div>

          {/* {typeof data.numberOFSendMessageLimit === "number" && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Send limit</span>
              <span className="font-medium">
                {data.numberOFSendMessageLimit}
              </span>
            </div>
          )} */}
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

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update starting date & time</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label htmlFor="datetime">Starting at</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={localDateTime}
                  onChange={(e) => setLocalDateTime(e.target.value)}
                  className="border-lime-500/60 focus-visible:ring-lime-600"
                />
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
