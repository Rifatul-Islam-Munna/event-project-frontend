"use client";

import Link from "next/link";
import { Menu, Mountain, Info, LogIn, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserInfo } from "@/actions/auth";
import { User } from "@/@types/user-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avatr from "./avatar.png";
export function SiteHeader() {
  const pathName = usePathname();
  const [user, setUser] = useState<null | User>();
  useEffect(() => {
    const geteleMent = async () => {
      const data = await getUserInfo();
      setUser(data);
    };
    geteleMent();
  }, [pathName]);
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Mountain className="h-6 w-6" />
          <span className="font-bold text-lg">Digital Seating</span>
        </Link>
        {user ? (
          <div>
            <Avatar
              onClick={() => router.push("/dashboard")}
              className=" cursor-pointer"
            >
              <AvatarImage src={avatr.src} alt="@shadcn" />
              <AvatarFallback>User</AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <nav className=" md:flex items-center space-x-4">
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              How it Works
            </Link>
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
