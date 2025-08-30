"use client";

import { getUserInfo } from "@/actions/auth";
import { deleteEvent } from "@/actions/fetch-action";
import { EventTable } from "@/components/custom/dasboard/event-table";
import { UserInfoCard } from "@/components/custom/dasboard/user-info-card";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

// Define a type for your Event data
export type Event = {
  id: string;
  name: string;
  date: string; // Storing as string for simplicity with date input
  location: string;
  logo_path?: string | File; // This will store the URL for display
  slug: string;
};

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: uuidv4(),
      name: "Sarah & Mark's Wedding",
      date: "2025-09-15",
      location: "The Grand Venue",
      logo_path: "/placeholder.svg?height=50&width=50",
      slug: "sarah-marks-wedding",
    },
    {
      id: uuidv4(),
      name: "Annual Tech Conference",
      date: "2025-10-20",
      location: "Convention Center",
      logo_path: "/placeholder.svg?height=50&width=50",
      slug: "annual-tech-conference",
    },
    {
      id: uuidv4(),
      name: "Family Reunion 2025",
      date: "2025-08-01",
      location: "Lakeside Resort",
      logo_path: "/placeholder.svg?height=50&width=50",
      slug: "family-reunion-2025",
    },
    {
      id: uuidv4(),
      name: "Charity Gala Night",
      date: "2025-11-10",
      location: "City Museum",
      logo_path: "/placeholder.svg?height=50&width=50",
      slug: "charity-gala-night",
    },
    {
      id: uuidv4(),
      name: "Company Holiday Party",
      date: "2025-12-18",
      location: "Downtown Loft",
      logo_path: "/placeholder.svg?height=50&width=50",
      slug: "company-holiday-party",
    },
  ]);

  const handleAddEvent = async (
    newEvent: Omit<Event, "id" | "slug"> & { logoFile?: File | null }
  ) => {
    const id = uuidv4();
    const name = newEvent.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const date = newEvent.date;
    const location = newEvent.location
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const email = (await getUserInfo()).email.split("@")[0];
    const random = Math.floor(Math.random() * 7000) + 1;

    const slug = `${name}-${date}-${location}-${email}-${random}`;
    const logo_path = newEvent.logoFile as File;

    const eventToAdd: Event = {
      id,
      slug,
      name: newEvent.name,
      date: newEvent.date,
      location: newEvent.location,
      logo_path,
    };
    console.log("eventToAdd", eventToAdd);

    /*  setEvents((prevEvents) => [...prevEvents, eventToAdd]); */
  };
  const query = useQueryClient();
  const handleUpdateEvent = (
    updatedEvent: Event & { logoFile?: File | null }
  ) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (event.id === updatedEvent.id) {
          const newLogoPath = updatedEvent.logoFile
            ? URL.createObjectURL(updatedEvent.logoFile)
            : updatedEvent.logo_path; // Keep existing if no new file
          return { ...updatedEvent, logo_path: newLogoPath };
        }
        return event;
      })
    );
  };
  const { mutate, isPending } = useMutation({
    mutationKey: ["delete-event"],
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error.message);
      }
      query.refetchQueries({ queryKey: ["get-all-events"], exact: false });
      toast.success("Event deleted successfully");
    },
  });
  const handleDeleteEvent = (eventId: string) => {
    mutate(eventId);
  };
  const router = useRouter();
  const handleManageEvent = (eventSlug: string, name: string, logo: string) => {
    console.log(
      `Navigating to manage event: /dashboard/events/${eventSlug}?name=${name}&logo=${logo}`
    );
    router.push(`/dashboard/events/${eventSlug}?name=${name}&logo=${logo}`);
  };

  return (
    <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 h-auto">
      <div className="container mx-auto py-8 px-4 md:px-6 space-y-8 ">
        <UserInfoCard />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <EventTable
              events={events}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              onManageEvent={handleManageEvent}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
