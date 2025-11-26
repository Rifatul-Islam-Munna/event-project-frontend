// components/site-header.tsx
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
import { Suspense, useCallback, useEffect, useState } from "react";
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
import ResponsiveTranslate from "./DropdownTranslator";
import GoogleTranslate from "./GoogleTranslate";

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
  console.log("isSubscriptionActive", user?.subscription?.endDate);

  console.log("isSubscriptionActive", isSubscriptionActive);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
          {data?.data?.imageUrl && (
            <Image
              src={data?.data?.imageUrl}
              alt="Logo"
              width={300}
              height={200}
              className="aspect-video w-2xs  object-cover"
            />
          )}
          {/*      <span className="font-bold text-sm sm:text-lg truncate">
            {data?.data?.title}
          </span> */}
        </Link>
        <div className=" flex items-center gap-1">
          {user ? (
            // Logged In User
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Pro Upgrade - Hidden on small screens when space is tight */}
              {!isSubscriptionActive && (
                <RainbowButton
                  onClick={() => router.push("/#pricing")}
                  variant="outline"
                  className="flex ml-0 p-1 sm:p-2 text-xs sm:text-sm"
                >
                  Upgrade <span className="hidden sm:inline">to Pro</span>
                </RainbowButton>
              )}

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0"
                  >
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarImage src={avatr.src} alt="User avatar" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-72 sm:w-80 p-0"
                  align="end"
                  forceMount
                >
                  {/* User Info Section */}
                  <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
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
                        <Mail className="h-3 w-3 text-slate-500 flex-shrink-0" />
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
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <Home className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium text-slate-900">
                            Dashboard
                          </span>
                          <span className="text-xs text-slate-500 truncate">
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
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium text-slate-900">
                            Billing
                          </span>
                          <span className="text-xs text-slate-500 truncate">
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
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium text-slate-900">
                          Sign Out
                        </span>
                        <span className="text-xs text-slate-500">
                          Log out of your account
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            // Not Logged In
            <div className="flex items-center gap-2 sm:gap-4">
              {/* How it Works - Hidden on small screens */}
              <Link
                href="#how-it-works"
                className="text-sm font-medium hover:underline underline-offset-4 hidden lg:block"
              >
                How it Works
              </Link>

              {/* Pro Upgrade */}
              {!isSubscriptionActive && (
                <RainbowButton
                  onClick={() => router.push("/#pricing")}
                  variant="outline"
                  className="flex ml-1.5 sm:ml-0 p-1 sm:p-2 text-xs sm:text-sm"
                >
                  Upgrade <span className="hidden sm:inline">to Pro</span>
                </RainbowButton>
              )}

              {/* Login Button */}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-border text-foreground hover:bg-muted hover:text-foreground bg-transparent text-xs sm:text-sm px-2 sm:px-4"
              >
                <Link href="/login">Login</Link>
              </Button>

              {/* Translation Component */}
            </div>
          )}

          <GoogleTranslate />
        </div>
      </div>
    </header>
  );
}
