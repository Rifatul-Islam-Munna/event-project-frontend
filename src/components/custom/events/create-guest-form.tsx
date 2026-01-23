"use client";

import type React from "react";

import { useState } from "react";
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
import { DialogFooter } from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadOneGuest } from "@/actions/fetch-action";
import { toast } from "sonner";
import { Guest } from "@/@types/events-details";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { GetGuestType } from "@/actions/vendor-category-actions";

type CreateGuestFormProps = {
  onAddGuest: (guest: Omit<Guest, "id">) => void;
  onClose: () => void;
  eventId: string;
};

export function CreateGuestForm({
  onAddGuest,
  onClose,
  eventId,
}: CreateGuestFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [type, setType] = useState<string | undefined>(undefined);

  const pathName = usePathname();
  const query = useQueryClient();

  // Fetch guest types
  const { data: guestTypeData, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["guest-types", eventId],
    queryFn: () => GetGuestType(eventId),
    enabled: !!eventId,
    retry: false,
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["createGuest"],
    mutationFn: (payload: Record<string, unknown>) => uploadOneGuest(payload),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data.error.message);
      }
      onClose();

      setName("");
      setEmail("");
      setPhone("");
      setAdults(0);
      setChildren(0);
      setType(undefined);
      query.refetchQueries({ queryKey: ["get-all-guest"], exact: false });
      return toast.success("Guest added successfully");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newGuest: Omit<Guest, "id"> & { type?: string } = {
      name,
      email,
      phone,
      adults: adults,
      children: children,
      event_id: pathName.split("/").pop(),
      ...(type && type !== "none" && { type }), // Only include if selected and not "none"
    };

    mutate(newGuest);
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
          Email (optional)
        </Label>
        <Input
          id="guestEmail"
          type="email"
          placeholder="john.doe@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="guestAdults" className="text-foreground">
            Adults
          </Label>
          <Input
            id="guestAdults"
            type="number"
            placeholder="2 (max 7)"
            value={adults > 0 ? adults : ""}
            onChange={(e) => setAdults(Number(e.target.value))}
            max={7}
            className="border-border focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <Label htmlFor="guestChildren" className="text-foreground">
            Children
          </Label>
          <Input
            id="guestChildren"
            type="number"
            placeholder="2 (max 7)"
            max={7}
            value={children > 0 ? children : ""}
            onChange={(e) => setChildren(Number(e.target.value))}
            className="border-border focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="guestPhone" className="text-foreground">
          Phone (include country code)
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

      <DialogFooter className="mt-4">
        <Button
          type="submit"
          className="w-full bg-lime-600 text-primary-foreground hover:bg-lime-700"
          disabled={isPending}
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Add Guest
        </Button>
      </DialogFooter>
    </form>
  );
}
