"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Guest } from "@/@types/events-details";
import { updateGuest } from "@/actions/fetch-action";
import { GetGuestType } from "@/actions/vendor-category-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type EditGuestFormProps = {
  guest: Guest;
  onClose: () => void;
};

export function EditGuestForm({ guest, onClose }: EditGuestFormProps) {
  const [name, setName] = useState(guest.name);
  const [email, setEmail] = useState(guest.email);
  const [phone, setPhone] = useState(guest.phone || "");
  const [type, setType] = useState<string | undefined>(guest.type || undefined);

  const query = useQueryClient();
  const guestEventId = guest.event_id ?? "";

  // Fetch guest types for the event
  const { data: guestTypeData, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["guest-types", guestEventId],
    queryFn: () => GetGuestType(guestEventId),
    enabled: Boolean(guestEventId),
    retry: false,
  });

  useEffect(() => {
    setName(guest.name);
    setEmail(guest.email);
    setPhone(guest.phone || "");
    setType(guest.type || undefined);
  }, [guest]);

  const { mutate, isPending } = useMutation({
    mutationKey: ["updateGuest"],
    mutationFn: (payload: Guest) => updateGuest(payload),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data.error.message);
      }
      onClose();
      query.refetchQueries({ queryKey: ["get-all-guest"], exact: false });
      return toast.success("Guest updated successfully");
    },
    onError: (error) => {
      return toast.error(error?.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email) {
      return toast.error("Name and Email are required.");
    }

    const updatedGuest: Guest = {
      ...guest,
      name,
      email,
      phone,
      ...(type && type !== "none" && { type }),
    };
    mutate(updatedGuest);
  };

  // Get available guest types from the fetched data
  const availableTypes = guestTypeData?.data?.type || [];

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="guestName" className="text-foreground">
          Name
        </Label>
        <Input
          id="guestName"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-border focus:ring-primary focus:border-primary"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="guestEmail" className="text-foreground">
          Email
        </Label>
        <Input
          id="guestEmail"
          type="email"
          placeholder="john.doe@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-border focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Guest Type Dropdown - Optional */}
      <div className="grid gap-2">
        <Label htmlFor="guestType" className="text-foreground">
          Guest Type (optional)
        </Label>
        {isLoadingTypes ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading types...
          </div>
        ) : availableTypes.length > 0 ? (
          <Select
            value={type || "none"}
            onValueChange={(value) =>
              setType(value === "none" ? undefined : value)
            }
          >
            <SelectTrigger className="border-border focus:ring-lime-500 focus:border-lime-500">
              <SelectValue placeholder="Select guest type (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Type</SelectItem>
              {availableTypes.map((guestType: string, index: number) => (
                <SelectItem key={index} value={guestType}>
                  {guestType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-muted-foreground">
            No guest types available for this event
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="guestPhone" className="text-foreground">
          Phone (Optional)
        </Label>
        <Input
          id="guestPhone"
          type="tel"
          placeholder="123-456-7890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border-border focus:ring-primary focus:border-primary"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          type="submit"
          className="bg-lime-600 text-primary-foreground hover:bg-lime-700"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Guest
        </Button>
      </div>
    </form>
  );
}
