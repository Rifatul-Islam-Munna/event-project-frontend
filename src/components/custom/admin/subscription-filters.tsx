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
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
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
      page: 1,
    });
  };

  const hasActiveFilters =
    filters.subscriptionType || filters.status || filters.q;

  return (
    <div className="space-y-6">
      {/* Header with Clear Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-100">
            <SlidersHorizontal className="h-5 w-5 text-lime-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Filter & Search
            </h3>
            <p className="text-sm text-slate-600">
              Refine your subscription results
            </p>
          </div>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="border-slate-300 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Main Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-lime-600 transition-colors" />
          <Input
            placeholder="Search by name or email..."
            value={filters.q || ""}
            onChange={(e) => updateFilter("q", e.target.value)}
            className="pl-10 border-slate-300 focus:border-lime-500 focus:ring-lime-500/20 h-11"
          />
          {filters.q && (
            <button
              onClick={() => updateFilter("q", "")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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
          <SelectTrigger className="border-slate-300 focus:border-lime-500 focus:ring-lime-500/20 h-11">
            <SelectValue placeholder="Subscription Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="font-medium">All Types</span>
            </SelectItem>
            <SelectItem value="basic">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Basic
              </div>
            </SelectItem>
            <SelectItem value="premium">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-lime-500" />
                Premium
              </div>
            </SelectItem>
            <SelectItem value="enterprise">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                Enterprise
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            value === "all"
              ? updateFilter("status", undefined)
              : updateFilter("status", value)
          }
        >
          <SelectTrigger className="border-slate-300 focus:border-lime-500 focus:ring-lime-500/20 h-11">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="font-medium">All Status</span>
            </SelectItem>
            <SelectItem value="active">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Active
              </div>
            </SelectItem>
            <SelectItem value="expired">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                Expired
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => updateFilter("sortBy", value)}
        >
          <SelectTrigger className="border-slate-300 focus:border-lime-500 focus:ring-lime-500/20 h-11">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="startedDate">Start Date</SelectItem>
            <SelectItem value="endDate">End Date</SelectItem>
            <SelectItem value="subscriptionType">Subscription Type</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Order & Items Per Page */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Order:</span>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => updateFilter("sortOrder", value)}
            >
              <SelectTrigger className="w-36 h-9 border-slate-300 focus:border-lime-500 focus:ring-lime-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">
                  <div className="flex items-center gap-2">
                    <span>↓</span>
                    Descending
                  </div>
                </SelectItem>
                <SelectItem value="asc">
                  <div className="flex items-center gap-2">
                    <span>↑</span>
                    Ascending
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-slate-300" />

          {/* Items Per Page */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Show:</span>
            <Select
              value={filters.limit.toString()}
              onValueChange={(value) =>
                updateFilter("limit", Number.parseInt(value))
              }
            >
              <SelectTrigger className="w-36 h-9 border-slate-300 focus:border-lime-500 focus:ring-lime-500/20">
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
        </div>

        {/* Active Filters Count */}
        {hasActiveFilters && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-100 border border-lime-200">
            <div className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
            <span className="text-sm font-medium text-lime-700">
              {
                [filters.subscriptionType, filters.status, filters.q].filter(
                  Boolean,
                ).length
              }{" "}
              active filters
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
