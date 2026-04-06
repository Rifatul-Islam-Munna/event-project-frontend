"use client";

import * as React from "react";
import {
  CreditCard,
  FileText,
  Heading1,
  ImageIcon,
  Layers3,
  ShieldCheck,
  Users2,
  ArrowLeftCircle,
  NotepadText,
  Tag,
  LayoutDashboard,
  Gift,
  PuzzleIcon,
  ReceiptText,
} from "lucide-react";

import { NavMain } from "./nav-main";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Subscription",
      url: "/admin/dashboard/subscription",
      icon: CreditCard,
    },
    {
      title: "Plans",
      url: "/admin/dashboard/plans",
      icon: Layers3,
    },
    {
      title: "Invoices",
      url: "/admin/dashboard/invoices",
      icon: ReceiptText,
    },
    {
      title: "Coupon",
      url: "/admin/dashboard/coupon",
      icon: Gift,
    },
    {
      title: "Add On",
      url: "/admin/dashboard/add-on",
      icon: PuzzleIcon,
    },
    {
      title: "Users",
      url: "/admin/dashboard/users",
      icon: Users2,
    },
    {
      title: "Title",
      url: "/admin/dashboard/title",
      icon: Heading1,
    },
    {
      title: "Images",
      url: "/admin/dashboard/images",
      icon: ImageIcon,
    },
    {
      title: "Terms",
      url: "/admin/dashboard/terms",
      icon: FileText,
    },
    {
      title: "Privacy",
      url: "/admin/dashboard/privacy",
      icon: ShieldCheck,
    },
    {
      title: "Vendor Category",
      url: "/admin/dashboard/seo",
      icon: ArrowLeftCircle,
    },
    {
      title: "Template",
      url: "/admin/dashboard/template",
      icon: NotepadText,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="pt-20 border-r border-lime-100 bg-white"
      collapsible="offcanvas"
      {...props}
    >
      <SidebarHeader className="px-4 pb-4 border-b border-lime-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              {/* Logo / Brand area */}
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-lime-500 to-lime-700 flex items-center justify-center shadow-md shadow-lime-200">
                  <LayoutDashboard className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-slate-800 text-base tracking-tight">
                  Admin Panel
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
