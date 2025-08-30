"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserInfo, logoutUser } from "@/actions/auth";
import { User } from "@/@types/user-types";
import Link from "next/link";
import { format, isValid, parseISO } from "date-fns";

export function UserInfoCard() {
  const [user, setUser] = useState<User | null>(null);
  const handleLogout = async () => {
    await logoutUser();
  };
  useEffect(() => {
    const getuserInfo = async () => {
      const info = await getUserInfo();
      setUser(info);
    };
    getuserInfo();
  }, []);

  return (
    <Card className="border border-gray-200/80 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 shadow-none ">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-gray-700">
          User Profile
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="border-border bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-xs rounded-full hover:text-white cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-3">
          <User2 className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-lg font-medium text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {user?.subscription?.endDate && (
              <p className="text-sm text-muted-foreground">
                {" "}
                Subscription Expire at:{" "}
                {format(
                  parseISO(user?.subscription?.endDate ?? ""),
                  "d MMMM yyyy"
                )}
              </p>
            )}

            {user?.type === "admin" && (
              <Link href={"/admin/dashboard"}>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  className=" mt-3 shadow-none"
                >
                  Admin Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Manage your events and settings here.
        </CardDescription>
      </CardContent>
    </Card>
  );
}
