"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { SubscriptionFilters } from "@/@types/admin";

interface SubscriptionFiltersProps {
  filters: SubscriptionFilters;
  onFiltersChange: (filters: SubscriptionFilters) => void;
  onClearFilters: () => void;
}

export function SubscriptionFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
}: SubscriptionFiltersProps) {
  const updateFilter = (key: keyof SubscriptionFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const hasActiveFilters =
    filters.subscriptionType || filters.status || filters.q;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions..."
              value={filters.q || ""}
              onChange={(e) => updateFilter("q", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Subscription Type */}
          <Select
            value={filters.subscriptionType || "all"}
            onValueChange={(value) =>
              value === "all"
                ? updateFilter("subscriptionType", undefined)
                : updateFilter("subscriptionType", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Subscription Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              value === "all"
                ? updateFilter("status", undefined)
                : updateFilter("status", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter("sortBy", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="startedDate">Start Date</SelectItem>
              <SelectItem value="endDate">End Date</SelectItem>
              <SelectItem value="subscriptionType">
                Subscription Type
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Order */}
          <Select
            value={filters.sortOrder}
            onValueChange={(value) => updateFilter("sortOrder", value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>

          {/* Items per page */}
          <Select
            value={filters.limit.toString()}
            onValueChange={(value) =>
              updateFilter("limit", Number.parseInt(value))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
