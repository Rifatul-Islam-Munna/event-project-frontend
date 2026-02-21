"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Layers,
  CheckCircle2,
  DollarSign,
  ArrowLeft,
  Eye,
  TrendingUp,
  Star,
  Hash,
} from "lucide-react";
import { CreatePlanRequest, PricingPlan } from "@/@types/pricing";
import { PlansTable } from "@/components/custom/admin/plans-table";
import { PlanForm } from "@/components/custom/admin/plan-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createPlan,
  deletePlan,
  getAllThePlans,
  updatePlans,
} from "@/actions/fetch-action";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<PricingPlan | null>(null);

  const { data, refetch } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getAllThePlans(),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createPlan(payload),
    onSuccess: (data) => {
      if (data?.data) {
        refetch();
        setShowForm(false);
        return toast.success("Plan created successfully");
      }
      toast.error("Plan creation failed");
    },
  });

  const { mutate: updateDate, isPending: isUpdating } = useMutation({
    mutationFn: (payload: { id: string; data: Record<string, unknown> }) =>
      updatePlans(payload.id, payload.data),
    onSuccess: (data) => {
      if (data?.data) {
        refetch();
        setEditingPlan(null);
        setShowForm(false);
        return toast.success("Plan updated successfully");
      }
      toast.error("Plan update failed");
    },
  });

  const { mutate: DeleteFn, isPending: isDeleting } = useMutation({
    mutationFn: (payload: string) => deletePlan(payload),
    onSuccess: (data) => {
      if (data?.data) {
        refetch();
        return toast.success("Plan deleted successfully");
      }
      toast.error("Plan deletion failed");
    },
  });

  const handleCreatePlan = (planData: CreatePlanRequest) => {
    mutate({
      ...planData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUpdatePlan = (planData: CreatePlanRequest) => {
    if (!editingPlan) return;
    updateDate({
      id: editingPlan._id,
      data: {
        ...editingPlan,
        ...planData,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };
  const handleViewPlan = (plan: PricingPlan) => setViewingPlan(plan);
  const handleDeletePlan = (planId: string) => DeleteFn(planId);

  // ─── VIEW DETAILS ────────────────────────────────────────────────────────────
  if (viewingPlan) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewingPlan(null)}
              className="hover:bg-lime-50 hover:text-lime-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Plans
            </Button>
            <span className="text-slate-400">/</span>
            <span className="text-sm text-slate-600 font-medium">
              {viewingPlan.title}
            </span>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 max-w-4xl">
          {/* Plan Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center shadow-md">
                  <Layers className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-slate-900">
                      {viewingPlan.title}
                    </h1>
                    {/* ✅ isPopular badge */}
                    {viewingPlan.isPopular && (
                      <Badge className="bg-amber-100 text-amber-700 border border-amber-200 gap-1">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {viewingPlan.description}
                  </p>
                </div>
              </div>
              <Badge
                className={cn(
                  viewingPlan.active
                    ? "bg-lime-100 text-lime-700 border-lime-200"
                    : "bg-slate-100 text-slate-500 border-slate-200",
                  "border",
                )}
              >
                {viewingPlan.active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Price",
                value: `$${(viewingPlan.priceCents / 100).toFixed(2)}`,
                icon: DollarSign,
                color: "text-lime-600",
              },
              {
                label: "Currency",
                value: viewingPlan.currency,
                icon: DollarSign,
                color: "text-blue-600",
              },
              {
                label: "Order",
                value: `#${viewingPlan.order ?? "—"}`,
                icon: Hash,
                color: "text-purple-600",
              }, // ✅ order
              {
                label: "Version",
                value: `v${viewingPlan.version}`,
                icon: TrendingUp,
                color: "text-slate-600",
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
              >
                <p className="text-xs text-slate-500 font-medium mb-1">
                  {label}
                </p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* ✅ isPopular + Billing row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 font-medium mb-1">
                Billing Unit
              </p>
              <p className="text-lg font-semibold text-slate-800">
                {viewingPlan.billingUnit}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 font-medium mb-1">
                Popular Plan
              </p>
              <div className="flex items-center gap-2">
                <Star
                  className={cn(
                    "h-5 w-5",
                    viewingPlan.isPopular
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300",
                  )}
                />
                <span className="text-lg font-semibold text-slate-800">
                  {viewingPlan.isPopular ? "Yes — Highlighted" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
              <CheckCircle2 className="h-4 w-4 text-lime-600" />
              Permissions
              <Badge variant="secondary" className="ml-1">
                {viewingPlan.permissions.length}
              </Badge>
            </h3>
            <div className="flex flex-wrap gap-2">
              {viewingPlan.permissions.map((p, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lime-50 border border-lime-200 rounded-lg text-sm font-medium text-lime-700"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-lime-500" />
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Limits */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Resource Limits
              <Badge variant="secondary" className="ml-1">
                {viewingPlan.limits.length}
              </Badge>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {viewingPlan.limits.map((limit, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <span className="text-sm text-slate-600 font-medium">
                    {limit.key}
                  </span>
                  <span
                    className={cn(
                      "font-bold text-base",
                      limit.limit === -1 ? "text-lime-600" : "text-slate-900",
                    )}
                  >
                    {limit.limit === -1
                      ? "Unlimited"
                      : limit.limit.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleEditPlan(viewingPlan)}
              className="flex-1 bg-lime-600 hover:bg-lime-700 text-white"
            >
              Edit Plan
            </Button>
            <Button
              variant="outline"
              onClick={() => setViewingPlan(null)}
              className="flex-1 border-slate-300 hover:bg-slate-100"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── CREATE / EDIT FORM ──────────────────────────────────────────────────────
  if (showForm) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setEditingPlan(null);
              }}
              className="hover:bg-lime-50 hover:text-lime-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Plans
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          {/* ✅ PlanForm receives editingPlan which has order + isPopular */}
          <PlanForm
            onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan}
            onCancel={() => {
              setShowForm(false);
              setEditingPlan(null);
            }}
            initialData={editingPlan || undefined}
            isPending={isPending || isUpdating}
          />
        </div>
      </div>
    );
  }

  // ─── MAIN LIST PAGE ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center shadow-md">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Pricing Plans
                </h1>
                <p className="text-sm text-slate-500">
                  Manage subscriptions, permissions and limits
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-lime-600 hover:bg-lime-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Plans",
              value: data?.data?.length ?? 0,
              icon: Layers,
              bg: "bg-blue-100",
              color: "text-blue-600",
            },
            {
              label: "Active",
              value: data?.data?.filter((p) => p.active).length ?? 0,
              icon: CheckCircle2,
              bg: "bg-lime-100",
              color: "text-lime-600",
            },
            {
              // ✅ Popular plans count
              label: "Popular",
              value: data?.data?.filter((p) => p.isPopular).length ?? 0,
              icon: Star,
              bg: "bg-amber-100",
              color: "text-amber-600",
            },
            {
              label: "Avg. Permissions",
              value: data?.data?.length
                ? Math.round(
                    data.data.reduce((a, p) => a + p.permissions.length, 0) /
                      data.data.length,
                  )
                : 0,
              icon: Eye,
              bg: "bg-purple-100",
              color: "text-purple-600",
            },
          ].map(({ label, value, icon: Icon, bg, color }) => (
            <Card key={label} className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center",
                      bg,
                    )}
                  >
                    <Icon className={cn("h-6 w-6", color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  All Plans
                </CardTitle>
                <p className="text-sm text-slate-500 mt-0.5">
                  {data?.data?.length ?? 0} plans total
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-lime-50 border border-lime-200">
                <div className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
                <span className="text-xs font-medium text-lime-700">
                  {data?.data?.filter((p) => p.active).length ?? 0} Active
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <PlansTable
                plans={data?.data || []}
                onEdit={handleEditPlan}
                onDelete={handleDeletePlan}
                onView={handleViewPlan}
                isLoading={isDeleting}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
