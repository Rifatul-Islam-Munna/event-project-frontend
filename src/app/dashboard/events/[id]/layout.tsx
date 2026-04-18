import type { ReactNode } from "react";

import { EventSectionsShell } from "@/components/custom/events/event-sections-shell";

type EventLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function EventLayout({
  children,
  params,
}: EventLayoutProps) {
  const { id } = await params;

  return <EventSectionsShell eventId={id}>{children}</EventSectionsShell>;
}
