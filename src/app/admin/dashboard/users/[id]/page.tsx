"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Crown,
  CreditCard,
  History,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  Sparkles,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAllThePlans,
  getAllUser,
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
  message?: number;
  email?: number;
  whatsapp?: number;
  flushCardCoupon?: string;
};

type UserEvent = {
  _id: string;
  name: string;
  event_type?: string;
  event_date?: string;
  location?: string;
  start_time?: string;
  createdAt?: string;
};

type UserLookupResponse = {
  data: DashboardUser[];
};

type UserEventsResponse = {
  data: UserEvent[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
};

type SummaryStatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
};

type DetailRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  valueClassName?: string;
};

type LimitItemProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  iconClassName: string;
};

const accountTypeMeta = {
  admin: {
    label: "Admin",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  user: {
    label: "User",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  editor: {
    label: "Editor",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
} as const;

const emptyEventsState: UserEventsResponse = {
  data: [],
  totalDocs: 0,
  totalPages: 1,
  currentPage: 1,
};

function formatDisplayDate(value?: string) {
  if (!value) {
    return "N/A";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return format(parsedDate, "PPP");
}

function getInitial(name: string) {
  const trimmedName = name.trim();
  return trimmedName ? trimmedName.charAt(0).toUpperCase() : "?";
}

function SummaryStatCard({
  icon: Icon,
  label,
  value,
  hint,
}: SummaryStatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm shadow-slate-950/5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="truncate text-base font-semibold text-slate-950">
            {value}
          </p>
          <p className="truncate text-xs text-slate-500">{hint}</p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className={cn("mt-1 text-sm font-medium text-slate-900", valueClassName)}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function LimitItem({
  icon: Icon,
  label,
  value,
  hint,
  iconClassName,
}: LimitItemProps) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
              iconClassName,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
          </div>
        </div>
        <span className="shrink-0 text-sm font-semibold text-slate-950">
          {value}
        </span>
      </div>
    </div>
  );
}

function UserDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_52%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-xl shadow-slate-950/5">
          <CardContent className="px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Skeleton className="h-[4.5rem] w-[4.5rem] rounded-[1.5rem]" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-36 rounded-lg" />
                  <Skeleton className="h-8 w-64 rounded-lg" />
                  <Skeleton className="h-5 w-72 rounded-lg" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 xl:w-[440px]">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Skeleton className="h-72 rounded-3xl" />
            <Skeleton className="h-60 rounded-3xl" />
          </div>
          <Skeleton className="h-[540px] rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const userId = resolvedParams.id;

  const { data: userData, isLoading: userLoading } = useQuery<UserLookupResponse>(
    {
      queryKey: ["user", userId],
      queryFn: async () => {
        const result = await getAllUser(1, 100, undefined, userId);
        return result.data ?? { data: [] };
      },
      staleTime: 5 * 60 * 1000,
    },
  );

  const user = userData?.data?.find((candidate) => candidate._id === userId);

  const { data: plansData = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const result = await getAllThePlans();
      const plans = result.data;

      if (Array.isArray(plans)) {
        return plans;
      }

      if (plans && typeof plans === "object" && Array.isArray(plans.data)) {
        return plans.data;
      }

      return [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: userLimitsData, isLoading: limitsLoading } = useQuery<
    UserLimit | null
  >({
    queryKey: ["user-limits", userId],
    queryFn: async () => {
      const result = await getUserLimit(userId);

      if (
        result.data &&
        typeof result.data === "object" &&
        !Array.isArray(result.data)
      ) {
        return result.data as UserLimit;
      }

      return null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: eventsData, isLoading: eventsLoading } =
    useQuery<UserEventsResponse>({
      queryKey: ["user-events", userId],
      queryFn: async () => {
        const result = await getEventsByUser(userId);

        if (
          result.data &&
          typeof result.data === "object" &&
          Array.isArray(result.data.data)
        ) {
          return result.data;
        }

        return emptyEventsState;
      },
      staleTime: 5 * 60 * 1000,
    });

  const getPlanName = (planId?: string) => {
    if (!planId) {
      return "No active plan";
    }

    const matchedPlan = plansData.find((plan) => plan._id === planId);
    return matchedPlan?.title || "Unknown plan";
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

  if (userLoading) {
    return <UserDetailSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_52%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Button
            onClick={() => router.push("/admin/dashboard/users")}
            variant="outline"
            className="w-full justify-center rounded-2xl border-slate-300 bg-white sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>

          <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-xl shadow-slate-950/5">
            <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-950 text-white">
                <User className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-950">
                  User not found
                </h1>
                <p className="max-w-md text-sm leading-6 text-slate-600">
                  This account could not be loaded. The record may have been
                  removed or the URL may be incorrect.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const planName = getPlanName(user.plan);
  const events = eventsData?.data ?? [];
  const eventCount = eventsData?.totalDocs ?? events.length;
  const totalCredits =
    (userLimitsData?.message ?? 0) +
    (userLimitsData?.whatsapp ?? 0) +
    (userLimitsData?.email ?? 0);

  const limitCards = [
    {
      icon: MessageSquare,
      label: "SMS credits",
      value: String(userLimitsData?.message ?? 0),
      hint: "Available message sends",
      iconClassName: "bg-sky-100 text-sky-700",
    },
    {
      icon: Phone,
      label: "WhatsApp credits",
      value: String(userLimitsData?.whatsapp ?? 0),
      hint: "Ready for WhatsApp outreach",
      iconClassName: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: Mail,
      label: "Email credits",
      value: String(userLimitsData?.email ?? 0),
      hint: "Campaign email balance",
      iconClassName: "bg-indigo-100 text-indigo-700",
    },
    {
      icon: CreditCard,
      label: "Flush card code",
      value: userLimitsData?.flushCardCoupon || "None",
      hint: "Optional coupon or card identifier",
      iconClassName: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_52%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
        <Button
          onClick={() => router.push("/admin/dashboard/users")}
          variant="outline"
          className="w-full justify-center rounded-2xl border-slate-300 bg-white/90 shadow-sm sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>

        <Card className="relative overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.55)]">
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-sky-500/10 via-cyan-500/8 to-blue-500/10" />
          <CardContent className="relative px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-700 text-2xl font-semibold text-white shadow-lg shadow-sky-500/20">
                  {getInitial(user.name)}
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700 hover:bg-sky-50">
                      <Sparkles className="h-3 w-3" />
                      Account Profile
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-3 py-1 font-semibold",
                        getAccountBadgeClassName(user.type),
                      )}
                    >
                      {getAccountLabel(user.type)}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                      {user.name}
                    </h1>
                    <p className="max-w-xl text-sm leading-6 text-slate-600">
                      Membership, credits, and activity in one compact admin view.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-slate-600 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-5 lg:gap-y-2">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{user.email}</span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      Joined {formatDisplayDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:w-[440px] xl:min-w-[440px]">
                <SummaryStatCard
                  icon={History}
                  label="Events"
                  value={String(eventCount)}
                  hint="Total activity"
                />
                <SummaryStatCard
                  icon={Crown}
                  label="Plan"
                  value={planName}
                  hint="Active tier"
                />
                <SummaryStatCard
                  icon={Zap}
                  label="Credits"
                  value={String(totalCredits)}
                  hint="All channels"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="border-slate-200/80 bg-white/90 shadow-sm shadow-slate-950/5">
              <CardHeader className="space-y-2 border-b border-slate-200/80">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                  <Shield className="h-5 w-5 text-slate-700" />
                  Account Overview
                </CardTitle>
                <CardDescription>
                  Core details for identity, role, and account timeline.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <DetailRow
                  icon={User}
                  label="Full name"
                  value={user.name}
                />
                <DetailRow
                  icon={Mail}
                  label="Email address"
                  value={user.email}
                  valueClassName="break-all"
                />
                <DetailRow
                  icon={Shield}
                  label="Account type"
                  value={getAccountLabel(user.type)}
                />
                <DetailRow
                  icon={CalendarDays}
                  label="Joined on"
                  value={formatDisplayDate(user.createdAt)}
                />
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 shadow-sm shadow-slate-950/5">
              <CardHeader className="space-y-2 border-b border-slate-200/80">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Subscription Snapshot
                </CardTitle>
                <CardDescription>
                  The current plan and status attached to this account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                        Active plan
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-950">
                        {planName}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <Crown className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-600">
                      Subscription status
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-3 py-1 font-semibold",
                        user.plan
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-600",
                      )}
                    >
                      {user.plan ? "Active" : "No plan"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 shadow-sm shadow-slate-950/5">
              <CardHeader className="space-y-2 border-b border-slate-200/80">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                  <Zap className="h-5 w-5 text-sky-600" />
                  Add-ons and Limits
                </CardTitle>
                <CardDescription>
                  Communication balances and custom coupon access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {limitsLoading ? (
                  <>
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                  </>
                ) : (
                  limitCards.map((item) => <LimitItem key={item.label} {...item} />)
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200/80 bg-white/90 shadow-sm shadow-slate-950/5">
            <CardHeader className="flex flex-col gap-4 border-b border-slate-200/80 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-950 sm:text-xl">
                  <History className="h-5 w-5 text-slate-700" />
                  Event History
                </CardTitle>
                <CardDescription>
                  A responsive list of the user&apos;s recent events and locations.
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className="rounded-full bg-slate-100 px-3 py-1 text-slate-700"
              >
                {eventCount} {eventCount === 1 ? "event" : "events"}
              </Badge>
            </CardHeader>

            <CardContent className="pt-6">
              {eventsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 rounded-2xl md:hidden" />
                  <Skeleton className="h-24 rounded-2xl md:hidden" />
                  <Skeleton className="hidden h-14 rounded-xl md:block" />
                  <Skeleton className="hidden h-20 rounded-xl md:block" />
                  <Skeleton className="hidden h-20 rounded-xl md:block" />
                </div>
              ) : events.length > 0 ? (
                <>
                  <div className="grid gap-3 md:hidden">
                    {events.map((event) => (
                      <div
                        key={event._id}
                        className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-slate-950">
                              {event.name}
                            </p>
                            <Badge
                              variant="outline"
                              className="rounded-full border-slate-200 bg-white text-slate-600"
                            >
                              {event.event_type || "General"}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            <span>{formatDisplayDate(event.event_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4 text-slate-400" />
                            <span>{event.start_time || "Time not set"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>{event.location || "Location not provided"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block">
                    <Table className="min-w-[720px]">
                      <TableHeader>
                        <TableRow className="border-slate-200/80 hover:bg-transparent">
                          <TableHead className="px-4 font-semibold text-slate-600">
                            Event
                          </TableHead>
                          <TableHead className="px-4 font-semibold text-slate-600">
                            Type
                          </TableHead>
                          <TableHead className="px-4 font-semibold text-slate-600">
                            Date
                          </TableHead>
                          <TableHead className="px-4 font-semibold text-slate-600">
                            Time
                          </TableHead>
                          <TableHead className="px-4 font-semibold text-slate-600">
                            Location
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event) => (
                          <TableRow
                            key={event._id}
                            className="border-slate-200/70 bg-white/70"
                          >
                            <TableCell className="px-4 py-4 font-medium whitespace-normal text-slate-950">
                              {event.name}
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <Badge
                                variant="outline"
                                className="rounded-full border-slate-200 bg-slate-50 text-slate-700"
                              >
                                {event.event_type || "General"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-slate-600">
                              {formatDisplayDate(event.event_date)}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-slate-600">
                              {event.start_time || "N/A"}
                            </TableCell>
                            <TableCell className="px-4 py-4 whitespace-normal text-slate-600">
                              {event.location || "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white">
                    <History className="h-7 w-7" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-slate-950">
                    No events found
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    This user does not have any recorded events yet. When events
                    are created, they will appear here with dates and locations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
