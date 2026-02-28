import { AppSidebar } from "@/components/custom/common/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { LayoutDashboard } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <div className="flex flex-col flex-1 min-w-0">
          {/* ── Top bar ── */}
          <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-lime-100">
            {/* ✅ Hamburger — only visible on mobile */}
            <SidebarTrigger className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-lime-200 bg-white text-slate-600 hover:bg-lime-50 hover:text-lime-700 hover:border-lime-300 transition-all duration-200 shadow-sm" />

            {/* Brand — shown on mobile since sidebar is hidden */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-lime-500 to-lime-700 flex items-center justify-center">
                <LayoutDashboard className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-slate-800 text-sm">
                Admin Panel
              </span>
            </div>

            {/* Right side — put breadcrumb, user avatar etc here */}
            <div className="ml-auto" />
          </header>

          {/* ── Page content ── */}
          <main className="flex-1 ">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
