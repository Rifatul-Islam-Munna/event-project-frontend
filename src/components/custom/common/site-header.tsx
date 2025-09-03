"use client";

import Link from "next/link";
import {
  Menu,
  Mountain,
  Info,
  LogIn,
  Play,
  Home,
  CreditCard,
  LogOut,
  User,
  Mail,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getUserInfo, logoutUser } from "@/actions/auth";
import { User as UserType } from "@/@types/user-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avatr from "./avatar.png";
import { useQuery } from "@tanstack/react-query";
import { getHeader } from "@/actions/fetch-action";
import Image from "next/image";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { isAfter } from "date-fns";
import { RainbowButton } from "@/components/magicui/rainbow-button";

export function SiteHeader() {
  const pathName = usePathname();
  const [user, setUser] = useState<null | UserType>();
  const router = useRouter();
  const handleLogout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);
  const { data, isPending, refetch } = useQuery({
    queryKey: ["header"],
    queryFn: () => getHeader(),
    gcTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    const getElement = async () => {
      const data = await getUserInfo();
      setUser(data);
    };
    getElement();
  }, [pathName, handleLogout]);
  const isSubscriptionActive = user?.subscription?.endDate
    ? isAfter(new Date(user.subscription.endDate), new Date())
    : false;
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          {data?.data?.imageUrl && (
            <Image
              src={data?.data?.imageUrl}
              alt="Logo"
              width={50}
              height={50}
              className=" w-7 h-7"
            />
          )}

          <span className="font-bold text-sm sm:text-lg">
            {data?.data?.title}
          </span>
        </Link>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatr.src} alt="User avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80 p-0" align="center" forceMount>
              {/* User Info Section */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatr.src} alt="User avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user.name || "User Name"}
                  </p>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-slate-500" />
                    <p className="text-xs text-slate-600 truncate">
                      {user.email || "user@example.com"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/dashboard"
                    className="flex items-center w-full px-3 py-3 text-sm rounded-lg hover:bg-blue-50 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                      <Home className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        Dashboard
                      </span>
                      <span className="text-xs text-slate-500">
                        Manage your events
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/billing"
                    className="flex items-center w-full px-3 py-3 text-sm rounded-lg hover:bg-green-50 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        Billing Information
                      </span>
                      <span className="text-xs text-slate-500">
                        Manage subscription & payments
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem
                  className="cursor-pointer px-3 py-3 text-sm rounded-lg hover:bg-red-50 focus:bg-red-50 transition-colors duration-200"
                  onClick={handleLogout}
                >
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                    <LogOut className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">Sign Out</span>
                    <span className="text-xs text-slate-500">
                      Log out of your account
                    </span>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <nav className="md:flex items-center space-x-4">
            <Link
              href="#how-it-works"
              className="text-sm hidden sm:block font-medium hover:underline underline-offset-4"
            >
              How it Works
            </Link>
            {!isSubscriptionActive && (
              <RainbowButton
                onClick={() => router.push("/#pricing")}
                variant={"outline"}
                className=" p-1 sm:p-2 "
              >
                Upgrade to Pro
              </RainbowButton>
            )}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-border text-foreground hover:bg-muted hover:text-foreground bg-transparent"
            >
              <Link href="/login">Login</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
