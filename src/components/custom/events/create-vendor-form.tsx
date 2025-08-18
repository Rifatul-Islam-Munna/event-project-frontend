"use client";

import type React from "react";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { DialogFooter } from "@/components/ui/dialog";
import { Vendor } from "@/@types/events-details";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postVendor } from "@/actions/fetch-action";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

type CreateVendorFormProps = {
  onAddVendor: (vendor: Omit<Vendor, "id">) => void;
  onClose: () => void;
};

export function CreateVendorForm({
  onAddVendor,
  onClose,
}: CreateVendorFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");

  const [startingDate, setStartingDate] = useState<Date | undefined>(undefined);

  const query = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["createVendor"],
    mutationFn: (payload: Record<string, unknown>) => postVendor(payload),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data.error.message);
      }
      onClose();
      setName("");
      setEmail("");
      setWhatsapp("");
      setReminderMessage("");
      setStartingDate(undefined);
      query.refetchQueries({ queryKey: ["get-all-vendor"], exact: false });
      return toast.success("Vendor added successfully");
    },
  });
  const pathName = usePathname();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !whatsapp || !startingDate) {
      return toast.success(
        "Name, Email, WhatsApp, Starting Date, and End Date are required."
      );
    }

    const newVendor: Omit<Vendor, "id"> = {
      name,
      email,
      whatsapp,
      reminder_message: reminderMessage,
      starting_date: format(startingDate, "yyyy-MM-dd"),
      event_id: pathName.split("/").pop(),
    };
    mutate(newVendor);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="vendorName" className="text-foreground">
          Name
        </Label>
        <Input
          id="vendorName"
          type="text"
          placeholder="Catering Co."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-border focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="vendorEmail" className="text-foreground">
          Email
        </Label>
        <Input
          id="vendorEmail"
          type="email"
          placeholder="vendor@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-border focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="vendorWhatsapp" className="text-foreground">
          WhatsApp Number
        </Label>
        <Input
          id="vendorWhatsapp"
          type="tel"
          placeholder="e.g., +1234567890"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          required
          className="border-border focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="reminderMessage" className="text-foreground">
          Reminder Message (Optional)
        </Label>
        <Input
          id="reminderMessage"
          type="text"
          placeholder="Confirm final headcount"
          value={reminderMessage}
          onChange={(e) => setReminderMessage(e.target.value)}
          className="border-border focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="startingDate" className="text-foreground">
          Starting Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal border-border",
                !startingDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startingDate ? (
                format(startingDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-border bg-background">
            <Calendar
              mode="single"
              selected={startingDate}
              onSelect={setStartingDate}
              initialFocus
              className="border-none"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Removed Sent Status and Number of Reminders Sent fields */}
      <DialogFooter className="mt-4">
        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
          Create Vendor
        </Button>
      </DialogFooter>
    </form>
  );
}
