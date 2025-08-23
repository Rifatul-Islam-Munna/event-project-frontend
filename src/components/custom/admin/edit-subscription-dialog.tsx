"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Edit } from "lucide-react";
import { Subscription } from "@/@types/admin";

interface EditSubscriptionDialogProps {
  subscription: Subscription;
  onSave: (id: string, startDate: string, endDate: string) => void;
}

const toLocalISODate = (date) => {
  // Normalize to local midnight
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);

  // Adjust for timezone offset so it stays local
  const offset = normalized.getTimezoneOffset();
  const local = new Date(normalized.getTime() - offset * 60 * 1000);

  return local.toISOString();
};
export function EditSubscriptionDialog({
  subscription,
  onSave,
}: EditSubscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(
    new Date(subscription.startedDate)
  );
  const [endDate, setEndDate] = useState<Date>(new Date(subscription.endDate));

  const handleSave = () => {
    onSave(
      subscription._id,
      toLocalISODate(startDate),
      toLocalISODate(endDate)
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription Dates</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="user">User</Label>
            <Input
              id="user"
              value={`${subscription.userId.name} (${subscription.userId.email})`}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subscription-type">Subscription Type</Label>
            <Input
              id="subscription-type"
              value={subscription.subscriptionType}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="grid gap-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
