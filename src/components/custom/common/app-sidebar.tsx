"use client";

import * as React from "react";
import {
  CreditCard,
  FileText,
  Heading,
  Images,
  Layers,
  ShieldCheck,
  SquareDashedBottom,
  Users,
  StepBack,
  NotepadTextDashed,
} from "lucide-react";

import { NavMain } from "./nav-main";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
      icon: CreditCard, // or BadgeDollarSign, Crown
    },
    {
      title: "Plans",
      url: "/admin/dashboard/plans",
      icon: Layers, // or Package, BookOpen
    },
    {
      title: "User",
      url: "/admin/dashboard/users",
      icon: Users, // or User, UserCircle
    },
    {
      title: "Title",
      url: "/admin/dashboard/title",
      icon: Heading, // or Type, TextCursorInput
    },
    {
      title: "Images",
      url: "/admin/dashboard/images",
      icon: Images, // or Image, ImagePlus
    },
    {
      title: "Terms",
      url: "/admin/dashboard/terms",
      icon: FileText, // or ScrollText, FileCheck
    },
    {
      title: "Privacy",
      url: "/admin/dashboard/privacy",
      icon: ShieldCheck, // or Shield, Lock
    },
    {
      title: "Vendor category",
      url: "/admin/dashboard/seo",
      icon: StepBack, // or Shield, Lock
    },
    {
      title: "Template",
      url: "/admin/dashboard/template",
      icon: NotepadTextDashed, // or Shield, Lock
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className=" pt-11" collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            ></SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
