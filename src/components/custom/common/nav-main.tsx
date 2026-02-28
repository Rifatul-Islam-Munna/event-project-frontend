"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { m, LazyMotion, domAnimation } from "motion/react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ElementType;
  }[];
}) {
  const pathName = usePathname();

  return (
    <LazyMotion features={domAnimation}>
      <SidebarGroup className="p-0">
        <SidebarGroupContent>
          <SidebarMenu className="gap-1.5">
            {items.map((item, i) => {
              const isActive = pathName === item.url;
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.title}>
                  <m.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                  >
                    <Link href={item.url} className="block">
                      <div
                        className={cn(
                          // ✅ Named group — hover is scoped to THIS item only
                          "group/item flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer",
                          isActive
                            ? "bg-gradient-to-r from-lime-500 to-lime-700 shadow-md shadow-lime-200 text-white"
                            : "text-slate-600 hover:bg-lime-50",
                        )}
                      >
                        {/* Icon box */}
                        <div
                          className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                            isActive
                              ? "bg-white/20 text-white"
                              : // ✅ group-hover/item — only reacts to THIS item's hover
                                "bg-slate-100 text-slate-500 group-hover/item:bg-lime-100 group-hover/item:text-lime-600",
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                        </div>

                        {/* Label */}
                        <span
                          className={cn(
                            "text-sm font-semibold tracking-tight transition-colors duration-200",
                            isActive
                              ? "text-white"
                              : // ✅ group-hover/item — only reacts to THIS item's hover
                                "text-slate-700 group-hover/item:text-lime-700",
                          )}
                        >
                          {item.title}
                        </span>

                        {/* Active dot */}
                        {isActive && (
                          <m.div
                            layoutId="active-dot"
                            className="ml-auto h-2 w-2 rounded-full bg-white/80"
                          />
                        )}
                      </div>
                    </Link>
                  </m.div>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </LazyMotion>
  );
}
