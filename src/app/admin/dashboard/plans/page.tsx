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

export default function AdminPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<PricingPlan | null>(null);

  const { data, refetch } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getAllThePlans(),
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["plans"],
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

  const { mutate: updateDate, isPending: isUpdateing } = useMutation({
    mutationKey: ["plans"],
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
    mutationKey: ["plans"],
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
    const newPlan = {
      ...planData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    };
    mutate(newPlan);
  };

  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleUpdatePlan = (planData: CreatePlanRequest) => {
    if (!editingPlan) return;
    const updatedPlan = {
      ...editingPlan,
      ...planData,
      updatedAt: new Date().toISOString(),
    };
    updateDate({ id: editingPlan._id, data: updatedPlan });
  };

  const handleDeletePlan = (planId: string) => {
    DeleteFn(planId);
  };

  const handleViewPlan = (plan: PricingPlan) => {
    setViewingPlan(plan);
  };

  // VIEW PLAN DETAILS PAGE
  if (viewingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
        {/* Breadcrumb Navigation */}
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => setViewingPlan(null)}
              className="hover:bg-lime-50 hover:text-lime-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <Card className="max-w-5xl mx-auto border-slate-200 shadow-md">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-lime-50 to-lime-100/30 pb-8">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 shadow-lg shadow-lime-500/30">
                      <Layers className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-900">
                        {viewingPlan.title}
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {viewingPlan.description}
                      </p>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={viewingPlan.active ? "default" : "secondary"}
                  className={
                    viewingPlan.active ? "bg-lime-500 hover:bg-lime-600" : ""
                  }
                >
                  {viewingPlan.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {/* Pricing & Billing Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200 bg-gradient-to-br from-lime-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-lime-500 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Pricing</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-600">Price</span>
                        <span className="text-xl font-bold text-lime-600">
                          ${(viewingPlan.priceCents / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-600">Currency</span>
                        <span className="font-medium text-slate-900">
                          {viewingPlan.currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-600">Billing</span>
                        <span className="font-medium text-slate-900">
                          {viewingPlan.billingUnit}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Metadata</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-600">Version</span>
                        <span className="font-medium text-slate-900">
                          v{viewingPlan.version}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-600">Created</span>
                        <span className="font-medium text-slate-900">
                          {new Date(viewingPlan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-600">Updated</span>
                        <span className="font-medium text-slate-900">
                          {new Date(viewingPlan.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Permissions Section */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-lime-600" />
                  <h3 className="font-semibold text-slate-900">
                    Permissions ({viewingPlan.permissions.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {viewingPlan.permissions.map((permission, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-lime-50 border border-lime-200 rounded-lg text-sm font-medium text-lime-700"
                    >
                      <div className="h-2 w-2 rounded-full bg-lime-500" />
                      {permission}
                    </div>
                  ))}
                </div>
              </div>

              {/* Limits Section */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">
                    Resource Limits ({viewingPlan.limits.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingPlan.limits.map((limit, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {limit.key}
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        {limit.limit === -1 ? (
                          <span className="text-lime-600">Unlimited</span>
                        ) : (
                          limit.limit
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
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
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // CREATE/EDIT FORM PAGE
  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
        {/* Breadcrumb Navigation */}
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setEditingPlan(null);
              }}
              className="hover:bg-lime-50 hover:text-lime-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <PlanForm
            onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan}
            onCancel={() => {
              setShowForm(false);
              setEditingPlan(null);
            }}
            initialData={editingPlan || undefined}
            isPending={isPending || isUpdateing}
          />
        </div>
      </div>
    );
  }

  // MAIN PLANS LIST PAGE
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Header Section */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 shadow-lg shadow-lime-500/30">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Pricing Plans
                </h1>
                <p className="text-sm text-slate-600">
                  Manage subscription tiers, permissions, and resource limits
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              className="bg-lime-600 hover:bg-lime-700 text-white shadow-lg shadow-lime-500/30 h-11"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Plans
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {data?.data?.length || 0}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <Layers className="h-7 w-7 text-blue-600" />
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
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {data?.data?.filter((p) => p.active).length || 0}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-lime-100 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-lime-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Price Range
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    $
                    {data?.data && data?.data?.length > 0
                      ? Math.min(
                          ...data.data.map((p) => p.priceCents / 100),
                        ).toFixed(0)
                      : "0"}{" "}
                    - $
                    {data?.data && data?.data?.length > 0
                      ? Math.max(
                          ...data.data.map((p) => p.priceCents / 100),
                        ).toFixed(0)
                      : "0"}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-lime-100 flex items-center justify-center">
                  <DollarSign className="h-7 w-7 text-lime-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Avg. Permissions
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {data?.data && data?.data?.length > 0
                      ? Math.round(
                          data.data.reduce(
                            (acc, p) => acc + p.permissions.length,
                            0,
                          ) / data.data.length,
                        )
                      : 0}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                  <Eye className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Table */}
        <Card className="border-slate-200 bg-white shadow-md">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  All Plans
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Manage pricing tiers and feature access
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-50 border border-lime-200">
                <div className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
                <span className="text-sm font-medium text-lime-700">
                  {data?.data?.filter((p) => p.active).length} Active
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
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
