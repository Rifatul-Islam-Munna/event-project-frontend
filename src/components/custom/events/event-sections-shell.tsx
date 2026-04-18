"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getUserInfo } from "@/actions/auth";
import type { User } from "@/@types/user-types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useStore } from "@/zustan-fn/save-alert";

type EventSectionsShellProps = {
  children: ReactNode;
  eventId: string;
};

type EventSection = {
  segment: string;
  label: string;
  icon: string;
  permission?: string;
};

const eventSections: EventSection[] = [
  {
    segment: "guests",
    label: "Guest List",
    icon: "/images/guestIcon.png",
  },
  {
    segment: "seating-chart",
    label: "Seating Chart",
    icon: "/images/chairIcon.png",
  },
  {
    segment: "vendors",
    label: "Vendors",
    icon: "/images/vendorIcon.png",
    permission: "vendor.manage",
  },
  {
    segment: "message",
    label: "Message",
    icon: "/images/message.png",
  },
  {
    segment: "template",
    label: "Template",
    icon: "/images/window.png",
  },
];

export function EventSectionsShell({
  children,
  eventId,
}: EventSectionsShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dataLength = useStore((state) => state.dataLength);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const info = await getUserInfo();
      setUser(info);
    };

    loadUser();
  }, []);

  const visibleSections = useMemo(
    () =>
      eventSections.filter(
        (section) =>
          !section.permission ||
          user?.plan?.permissions?.includes(section.permission),
      ),
    [user],
  );

  const queryString = searchParams.toString();

  const navigateToSection = (segment: string) => {
    const nextPath = `/dashboard/events/${eventId}/${segment}`;

    if (pathname === nextPath) {
      return;
    }

    if (dataLength > 0) {
      toast.error("Please save your changes before switching sections!");
      return;
    }

    router.push(queryString ? `${nextPath}?${queryString}` : nextPath);
  };

  return (
    <section className="min-h-dvh">
      <div className="mx-auto space-y-8 px-4 py-8 md:px-6">
        <Card className="border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <div
              className="sticky top-0 z-10 grid w-full border-b border-border bg-transparent"
              style={{
                gridTemplateColumns: `repeat(${Math.max(visibleSections.length, 1)}, minmax(0, 1fr))`,
              }}
            >
              {visibleSections.map((section) => {
                const isActive =
                  pathname === `/dashboard/events/${eventId}/${section.segment}`;

                return (
                  <button
                    key={section.segment}
                    type="button"
                    onClick={() => navigateToSection(section.segment)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 text-foreground transition-colors",
                      isActive &&
                        "border-lime-600 bg-transparent text-primary",
                    )}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Image
                        src={section.icon}
                        width={30}
                        height={30}
                        alt={section.label}
                      />
                      <p className="text-sm font-semibold">{section.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-none bg-transparent p-6">{children}</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
