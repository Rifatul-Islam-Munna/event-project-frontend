"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  GetGuestType,
  PostNewGuestType,
} from "@/actions/vendor-category-actions";

export function AddUserTypeDialog({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);

  const [newType, setNewType] = useState("");
  const [types, setTypes] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Fetch existing guest types when event_id is entered
  const { data: existingData, isLoading } = useQuery({
    queryKey: ["guest-types", eventId],
    queryFn: () => GetGuestType(eventId),
    enabled: !!eventId,
    retry: false,
  });

  // Mutation to save guest types
  const mutation = useMutation({
    mutationFn: PostNewGuestType,
    onSuccess: () => {
      toast.success("Guest types saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["guest-types"] });
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  useEffect(() => {
    if (existingData) {
      console.log("existingData->", existingData);
      setTypes(existingData?.data?.type || []);
    }
  }, [eventId, existingData]);

  const handleAddType = () => {
    if (newType.trim() && !types.includes(newType.trim())) {
      setTypes([...types, newType.trim()]);
      setNewType("");
    }
  };

  const handleRemoveType = (typeToRemove: string) => {
    setTypes(types.filter((t) => t !== typeToRemove));
  };

  const handleSubmit = () => {
    if (!eventId || types.length === 0) {
      toast.error("Please provide event ID and at least one guest type");
      return;
    }

    mutation.mutate({
      event_id: eventId,
      type: types,
    });
  };

  const handleClose = () => {
    setOpen(false);

    setNewType("");
    setTypes([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddType();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r py-5 from-lime-500 via-lime-600 to-lime-700 hover:from-lime-600 hover:via-lime-700 hover:to-lime-800 text-white  transition-all duration-300">
          <Plus className="h-4 w-4 mr-2" />
          Add User Type
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] border-lime-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-lime-700">
            <Users className="h-6 w-6" />
            Manage Guest Types
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Add or update guest types for your event. Enter event ID to load
            existing types.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Event ID Input */}
          <div className="space-y-2">
            {isLoading && (
              <p className="text-xs text-lime-600 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading existing types...
              </p>
            )}
            {existingData && (
              <p className="text-xs text-lime-600">
                ✓ Found existing guest types
              </p>
            )}
          </div>

          {/* Add New Type */}
          <div className="space-y-2">
            <Label
              htmlFor="new_type"
              className="text-sm font-semibold text-slate-700"
            >
              Guest Type
            </Label>
            <div className="flex gap-2">
              <Input
                id="new_type"
                placeholder="e.g., VIP, Regular, Staff"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-lime-200 focus:border-lime-500 focus:ring-lime-500"
              />
              <Button
                type="button"
                onClick={handleAddType}
                disabled={!newType.trim()}
                className="bg-lime-600 hover:bg-lime-700 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Display Added Types */}
          {types.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Added Types ({types.length})
              </Label>
              <div className="flex flex-wrap gap-2 p-4 bg-lime-50 rounded-lg border border-lime-200 min-h-[80px]">
                {types.map((type, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-lime-600 hover:bg-lime-700 text-white px-3 py-1.5 text-sm flex items-center gap-2"
                  >
                    {type}
                    <button
                      onClick={() => handleRemoveType(type)}
                      className="hover:bg-lime-800 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-lime-300 text-lime-700 hover:bg-lime-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending || !eventId || types.length === 0}
            className="bg-gradient-to-r from-lime-500 via-lime-600 to-lime-700 hover:from-lime-600 hover:via-lime-700 hover:to-lime-800 text-white shadow-lg"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Save Guest Types
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
