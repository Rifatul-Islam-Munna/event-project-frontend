"use client";

import type React from "react";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { DialogFooter } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadOneGuest } from "@/actions/fetch-action";
import { toast } from "sonner";
import { Guest } from "@/@types/events-details";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

type CreateGuestFormProps = {
  onAddGuest: (guest: Omit<Guest, "id">) => void;
  onClose: () => void;
};

export function CreateGuestForm({ onAddGuest, onClose }: CreateGuestFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const pathName = usePathname();

  const query = useQueryClient();
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
      query.refetchQueries({ queryKey: ["get-all-guest"], exact: false });
      return toast.success("Guest added successfully");
    },
  });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newGuest: Omit<Guest, "id"> = {
      name,
      email,
      phone,
      event_id: pathName.split("/").pop(),
    };

    mutate(newGuest);
  };

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
      <div className="grid gap-2">
        <Label htmlFor="guestPhone" className="text-foreground">
          Phone
        </Label>
        <Input
          id="guestPhone"
          type="tel"
          placeholder="123-456-7890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border-border focus:ring-primary focus:border-primary"
          required
        />
      </div>
      {/* Removed Seat Number and Is Assigned fields */}
      <DialogFooter className="mt-4">
        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isPending}
        >
          {isPending && <Loader2 className=" w-4 h-4 animate-spin" />} Add Guest
        </Button>
      </DialogFooter>
    </form>
  );
}
