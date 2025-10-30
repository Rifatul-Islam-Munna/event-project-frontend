"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User2,
  Calendar,
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Crown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getUserInfo, logoutUser } from "@/actions/auth";
import { User } from "@/@types/user-types";
import Link from "next/link";
import { format, isValid, parseISO, isAfter } from "date-fns";

export function UserInfoCard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getuserInfo = async () => {
      const info = await getUserInfo();
      setUser(info);
    };
    getuserInfo();
  }, []);

  const isSubscriptionActive = user?.subscription?.endDate
    ? isAfter(new Date(user.subscription.endDate), new Date())
    : false;

  const formattedDate = user?.subscription?.endDate
    ? format(parseISO(user.subscription.endDate), "d MMMM yyyy")
    : null;

  return (
    <Card className="border border-gray-200 shadow-none bg-white">
      <CardContent className="p-5">
        {/* User Info Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <User2 className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {user?.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Status Badge - Right side */}
          {user?.subscription?.endDate && (
            <Badge
              variant={isSubscriptionActive ? "default" : "destructive"}
              className={`flex-shrink-0 ${
                isSubscriptionActive
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white text-xs px-2.5 py-1`}
            >
              {isSubscriptionActive ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Expired
                </>
              )}
            </Badge>
          )}
        </div>

        {/* Subscription Info - Compact Row */}
        {user?.subscription?.endDate && (
          <div
            className={`rounded-md px-3 py-2.5 border mb-3 ${
              isSubscriptionActive
                ? "bg-green-50 border-green-300"
                : "bg-red-50 border-red-300"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Calendar
                  className={`h-4 w-4 flex-shrink-0 ${
                    isSubscriptionActive ? "text-green-700" : "text-red-700"
                  }`}
                />
                <div className="min-w-0">
                  <p
                    className={`text-xs font-medium ${
                      isSubscriptionActive ? "text-green-900" : "text-red-900"
                    }`}
                  >
                    {isSubscriptionActive
                      ? "Subscription Active"
                      : "Subscription Expired"}
                  </p>
                  <p
                    className={`text-xs ${
                      isSubscriptionActive ? "text-green-700" : "text-red-700"
                    } truncate`}
                  >
                    {isSubscriptionActive ? "Until " : "Expired "}
                    {formattedDate}
                  </p>
                </div>
              </div>

              {/* Renew Button - Inline */}
              {!isSubscriptionActive && (
                <Link href="/#pricing" className="flex-shrink-0">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white h-8 px-4 text-xs"
                  >
                    <Crown className="h-3 w-3 mr-1.5" />
                    Renew Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Admin Button - Inline, not full width */}
        {user?.type === "admin" && (
          <div className="flex justify-start">
            <Link href="/admin/dashboard">
              <Button
                size="sm"
                variant="outline"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 h-8 px-4 text-xs"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                Admin Dashboard
              </Button>
            </Link>
          </div>
        )}

        {/* Optional: Description at bottom */}
        <p className="text-xs text-gray-500 text-center mt-3 pt-3 border-t border-gray-100">
          Manage your events, guests, and settings
        </p>
      </CardContent>
    </Card>
  );
}
