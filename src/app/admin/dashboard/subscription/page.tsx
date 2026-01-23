"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionFilters, SubscriptionResponse } from "@/@types/admin";
import { toast } from "sonner";
import { SubscriptionFiltersComponent } from "@/components/custom/admin/subscription-filters";
import { SubscriptionTable } from "@/components/custom/admin/subscription-table";
import { SubscriptionPagination } from "@/components/custom/admin/subscription-pagination";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { getSubScribeDataAdmin, updateSubScribe } from "@/actions/fetch-action";
import { CreditCard } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [filters, setFilters] = useState<SubscriptionFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const urls = new URLSearchParams();
  urls.append("page", filters.page.toString());
  urls.append("limit", filters.limit.toString());
  if (filters.subscriptionType)
    urls.append("subscriptionType", filters.subscriptionType);
  if (filters.status) urls.append("status", filters.status);

  const [text] = useDebounce(filters.q, 1000);
  if (text) urls.append("q", text);
  if (filters.sortBy) urls.append("sortBy", filters.sortBy);
  if (filters.sortOrder) urls.append("sortOrder", filters.sortOrder);

  const {
    data: SubScriptionData,
    isLoading: isSubScriptionLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "subscriptions",
      filters.limit,
      filters.page,
      filters.subscriptionType,
      filters.status,
      text,
      filters.sortBy,
      filters.sortOrder,
    ],
    queryFn: () => getSubScribeDataAdmin(urls.toString()),
  });

  const handleFiltersChange = (newFilters: SubscriptionFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-subscription"],
    mutationFn: (payload: Record<string, unknown>) => updateSubScribe(payload),
    onSuccess: (data) => {
      if (data.data) {
        refetch();
        toast.success("Subscription updated successfully");
        return;
      }
      toast.error("Subscription update failed");
    },
  });

  const handleEditSubscription = async (
    id: string,
    startDate: string,
    endDate: string,
  ) => {
    const payload = { _id: id, startedDate: startDate, endDate: endDate };
    mutate(payload);
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) {
      return;
    }
    // Add your delete logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Header Section - European spacing with 32px/40px gaps */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 shadow-lg shadow-lime-500/30">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Subscription Management
              </h1>
              <p className="text-sm text-slate-600">
                Monitor and manage all user subscriptions across your platform
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 4px spacing system */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards - Optional but recommended for European style */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Subscriptions
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {SubScriptionData?.data?.total ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-lime-100 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-lime-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Active Plans
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {SubScriptionData?.data?.data?.filter(
                      (s) => new Date(s.endDate) > new Date(),
                    ).length ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-lime-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-lime-500 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Current Page
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {filters.page} /{" "}
                    {Math.ceil(
                      (SubScriptionData?.data?.total ?? 1) / filters.limit,
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">
                    {filters.page}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Data Card - European spacing: 24px/32px */}
        <Card className="border-slate-200 bg-white shadow-md">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  All Subscriptions
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  View and manage subscription details
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-50 border border-lime-200">
                <div className="h-2 w-2 rounded-full bg-lime-500" />
                <span className="text-sm font-medium text-lime-700">
                  Live Data
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Filters Section - 24px bottom spacing */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6">
              <SubscriptionFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Table Section - 32px spacing */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <SubscriptionTable
                subscriptions={SubScriptionData?.data?.data || []}
                isLoading={isSubScriptionLoading}
                onEdit={handleEditSubscription}
                onDelete={handleDeleteSubscription}
              />
            </div>

            {/* Pagination Section - Top border for separation */}
            <div className="border-t border-slate-200 pt-6">
              <SubscriptionPagination
                currentPage={SubScriptionData?.data?.page ?? 1}
                totalPages={Math.ceil(
                  (SubScriptionData?.data?.total ?? 1) / filters.limit,
                )}
                totalItems={SubScriptionData?.data?.total ?? 1}
                itemsPerPage={filters.limit}
                onPageChange={handlePageChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
