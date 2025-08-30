"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionFilters, SubscriptionResponse } from "@/@types/admin";
import { toast } from "sonner";
import { SubscriptionFiltersComponent } from "@/components/custom/admin/subscription-filters";
import { SubscriptionTable } from "@/components/custom/admin/subscription-table";
import { SubscriptionPagination } from "@/components/custom/admin/subscription-pagination";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { getSubScribeDataAdmin, updateSubScribe } from "@/actions/fetch-action";
// Mock data - replace with actual API call
const mockData: SubscriptionResponse = {
  data: [
    {
      _id: "68a899ba5001d5561be297c0",
      userId: {
        _id: "689a09bddd9b5c271f774315",
        name: "Rifat",
        email: "test@gmail.com",
      },
      startedDate: "2025-08-22T16:24:26.458Z",
      endDate: "2025-09-22T16:24:26.458Z",
      subscriptionType: "basic",
      createdAt: "2025-08-22T16:24:26.462Z",
      updatedAt: "2025-08-22T16:24:26.462Z",
      __v: 0,
    },
    {
      _id: "68a899ba5001d5561be297c1",
      userId: {
        _id: "689a09bddd9b5c271f774316",
        name: "John Doe",
        email: "john@example.com",
      },
      startedDate: "2025-07-15T10:30:00.000Z",
      endDate: "2025-08-15T10:30:00.000Z",
      subscriptionType: "premium",
      createdAt: "2025-07-15T10:30:00.000Z",
      updatedAt: "2025-07-15T10:30:00.000Z",
      __v: 0,
    },
    {
      _id: "68a899ba5001d5561be297c2",
      userId: {
        _id: "689a09bddd9b5c271f774317",
        name: "Jane Smith",
        email: "jane@company.com",
      },
      startedDate: "2025-06-01T08:00:00.000Z",
      endDate: "2026-06-01T08:00:00.000Z",
      subscriptionType: "enterprise",
      createdAt: "2025-06-01T08:00:00.000Z",
      updatedAt: "2025-06-01T08:00:00.000Z",
      __v: 0,
    },
  ],
  total: 3,
  page: 1,
  limit: 20,
};

export default function AdminSubscriptionsPage() {
  const [filters, setFilters] = useState<SubscriptionFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  console.log("filters->", filters);

  const [data, setData] = useState<SubscriptionResponse>(mockData);
  const [isLoading, setIsLoading] = useState(false);

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
      toast.error("Subscription updated Fail");
    },
  });
  const handleEditSubscription = async (
    id: string,
    startDate: string,
    endDate: string
  ) => {
    console.log("id->", id, "startDate->", startDate, "endDate->", endDate);
    const payload = { _id: id, startedDate: startDate, endDate: endDate };
    mutate(payload);
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) {
      return;
    }

    try {
      // In a real app, make API call to delete subscription
      // await fetch(`/api/admin/subscriptions/${id}`, { method: 'DELETE' });

      // For now, update local state
      setData((prevData) => ({
        ...prevData,
        data: prevData.data.filter((sub) => sub._id !== id),
        total: prevData.total - 1,
      }));
    } catch (error) {}
  };

  return (
    <div className="container mx-auto p-4 md:p-6 min-h-dvh">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Subscription Management
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor all user subscriptions
          </p>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            All Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SubscriptionFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          <div className="overflow-x-auto">
            <SubscriptionTable
              subscriptions={SubScriptionData?.data?.data || []}
              isLoading={isSubScriptionLoading}
              onEdit={handleEditSubscription}
              onDelete={handleDeleteSubscription}
            />
          </div>

          <SubscriptionPagination
            currentPage={SubScriptionData?.data?.page ?? 1}
            totalPages={(SubScriptionData?.data?.total ?? 1) / filters.limit}
            totalItems={SubScriptionData?.data?.total ?? 1}
            itemsPerPage={filters.limit}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
