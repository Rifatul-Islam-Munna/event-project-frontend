"use client";
import { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Crown,
  Calendar,
  MessageSquare,
  Phone,
  CreditCard,
  Zap,
  History,
} from "lucide-react";
import { format } from "date-fns";
import {
  getAllUser,
  getAllThePlans,
  getEventsByUser,
} from "@/actions/fetch-action";
import { getUserLimit } from "@/actions/vendor-category-actions";
import { cn } from "@/lib/utils";

type DashboardUser = {
  _id: string;
  name: string;
  email: string;
  type: "user" | "admin" | "editor";
  plan?: string;
  createdAt?: string;
};

type SubscriptionPlan = {
  _id: string;
  title: string;
  priceCents: number;
};

type UserLimit = {
  message: number;
  email: number;
  whatsapp: number;
  flushCardCoupon: string;
};

type PaginatedUsersData = {
  data: DashboardUser[];
  totalPages: number;
  totalDocs: number;
  currentPage: number;
};

type UserEvent = {
  _id: string;
  name: string;
  user_id: string;
  event_type: string;
  event_date: string;
  location: string;
  start_time: string;
  createdAt: string;
};

const accountTypeMeta = {
  admin: {
    label: "Admin",
    className: "border-amber-200 bg-amber-100 text-amber-800",
  },
  user: {
    label: "User",
    className: "border-blue-200 bg-blue-100 text-blue-800",
  },
  editor: {
    label: "Editor",
    className: "border-violet-200 bg-violet-100 text-violet-800",
  },
} as const;

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const userId = resolvedParams.id;

  const { data: userData } = useQuery<{ data: DashboardUser[] }>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const result = await getAllUser(1, 100, undefined, userId);
      return result.data ?? { data: [] };
    },
    staleTime: 5 * 60 * 1000,
  });

  const user = userData?.data?.find((u) => u._id === userId);

  const { data: plansData } = useQuery<SubscriptionPlan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const result = await getAllThePlans();
      const plansData = result.data;
      if (Array.isArray(plansData)) {
        return plansData;
      }
      if (
        plansData &&
        typeof plansData === "object" &&
        Array.isArray(plansData.data)
      ) {
        return plansData.data;
      }
      return [];
    },
  });

  const { data: userLimitsData } = useQuery<{ data: UserLimit }>({
    queryKey: ["user-limits", userId],
    queryFn: async () => {
      const result = await getUserLimit(userId);
      return result.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery<{
    data: UserEvent[];
    totalDocs: number;
  }>({
    queryKey: ["user-events", userId],
    queryFn: async () => {
      console.log("Fetching get-events-by-user for:", userId);
      const result = await getEventsByUser(userId);
      console.log("Events result:", result);
      const allEvents = result.data?.data || [];
      console.log("Got events:", allEvents.length);
      return {
        data: allEvents,
        totalDocs: allEvents.length,
        totalPages: 1,
        currentPage: 1,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const getPlanName = (planId?: string) => {
    if (!planId) return "No Plan";
    const plan = plansData?.find((p) => p._id === planId);
    return plan?.title || "Unknown Plan";
  };

  const getAccountBadgeClassName = (type = "user") => {
    return (
      accountTypeMeta[type as keyof typeof accountTypeMeta]?.className ||
      accountTypeMeta.user.className
    );
  };

  const getAccountLabel = (type = "user") => {
    return (
      accountTypeMeta[type as keyof typeof accountTypeMeta]?.label ||
      accountTypeMeta.user.label
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => router.push("/admin/dashboard/users")}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-600">User not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button
          onClick={() => router.push("/admin/dashboard/users")}
          variant="outline"
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {user.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(getAccountBadgeClassName(user.type))}
                    >
                      {getAccountLabel(user.type)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">
                      Joined:{" "}
                      {user.createdAt
                        ? format(new Date(user.createdAt), "PPP")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Subscription Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.plan ? (
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold text-amber-700">
                      {getPlanName(user.plan)}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-500">No active plan</span>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  Add-ons / Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">SMS</span>
                  </div>
                  <span className="font-semibold">
                    {userLimitsData?.message ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="text-sm">WhatsApp</span>
                  </div>
                  <span className="font-semibold">
                    {userLimitsData?.whatsapp ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Email</span>
                  </div>
                  <span className="font-semibold">
                    {userLimitsData?.email ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Flush Card</span>
                  </div>
                  <span className="font-semibold text-sm">
                    {userLimitsData?.flushCardCoupon || "None"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Event History ({eventsData?.totalDocs ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <p className="text-slate-500 text-sm">Loading events...</p>
                ) : eventsData?.data && eventsData.data.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Name</TableHead>

                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventsData.data.map((event) => (
                        <TableRow key={event._id}>
                          <TableCell className="font-medium">
                            {event.name}
                          </TableCell>

                          <TableCell>
                            {event.date
                              ? format(new Date(event.date), "PPP")
                              : "N/A"}
                          </TableCell>
                          <TableCell>{event.location || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-slate-500 text-sm">No events found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
