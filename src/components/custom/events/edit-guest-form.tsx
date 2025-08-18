"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Guest } from "@/@types/events-details";
import { updateGuest } from "@/actions/fetch-action";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type EditGuestFormProps = {
  guest: Guest;
  onUpdateGuest: (guest: Guest) => void;
  onClose: () => void;
};

export function EditGuestForm({
  guest,
  onUpdateGuest,
  onClose,
}: EditGuestFormProps) {
  const [name, setName] = useState(guest.name);
  const [email, setEmail] = useState(guest.email);
  const [phone, setPhone] = useState(guest.phone || "");
  // Removed seatNumber and isAssigned states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setName(guest.name);
    setEmail(guest.email);
    setPhone(guest.phone || "");
    // Removed seatNumber and isAssigned from useEffect dependencies
  }, [guest]);
  const query = useQueryClient();
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
    };
    mutate(updatedGuest);
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
      {/* Removed Seat Number and Is Assigned fields */}
      <div className="mt-4 flex justify-end">
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
          Update Guest
        </Button>
      </div>
    </form>
  );
}
