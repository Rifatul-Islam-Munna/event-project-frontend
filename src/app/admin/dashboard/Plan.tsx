"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
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

const initialPlans: PricingPlan[] = [
  {
    _id: "68aa2c8f9b5055d9e420ab74",
    title: "Basic Plan",
    description: "Perfect for small events",
    priceCents: 1900,
    currency: "USD",
    billingUnit: "PER_MONTH",
    permissions: [
      "user.create",
      "event.create",
      "qr.live",
      "csv.import",
      "email.send",
    ],
    limits: [
      { key: "guests.total_max", limit: 50 },
      { key: "vendor.limit", limit: 20 },
    ],
    version: 1,
    active: true,
    createdAt: "2025-08-23T21:03:11.424Z",
    updatedAt: "2025-08-23T21:03:11.424Z",
    __v: 0,
  },
  {
    _id: "68aa2c8f9b5055d9e420ab75",
    title: "Professional Plan",
    description: "Ideal for wedding planners and event coordinators",
    priceCents: 4900,
    currency: "USD",
    billingUnit: "PER_MONTH",
    permissions: [
      "user.create",
      "user.edit",
      "event.create",
      "event.edit",
      "qr.live",
      "csv.import",
      "email.send",
      "whatsapp.send",
      "vendor.manage",
    ],
    limits: [
      { key: "guests.total_max", limit: 200 },
      { key: "vendor.limit", limit: 100 },
      { key: "events.monthly_limit", limit: 50 },
    ],
    version: 1,
    active: true,
    createdAt: "2025-08-23T21:03:11.424Z",
    updatedAt: "2025-08-23T21:03:11.424Z",
    __v: 0,
  },
  {
    _id: "68aa2c8f9b5055d9e420ab76",
    title: "Enterprise Plan",
    description: "For large-scale events and corporate functions",
    priceCents: 9900,
    currency: "USD",
    billingUnit: "PER_MONTH",
    permissions: [
      "user.create",
      "user.edit",
      "user.delete",
      "event.create",
      "event.edit",
      "event.delete",
      "qr.live",
      "csv.import",
      "email.send",
      "whatsapp.send",
      "message.send",
      "vendor.manage",
    ],
    limits: [
      { key: "guests.total_max", limit: -1 },
      { key: "events.monthly_limit", limit: -1 },
    ],
    version: 1,
    active: true,
    createdAt: "2025-08-23T21:03:11.424Z",
    updatedAt: "2025-08-23T21:03:11.424Z",
    __v: 0,
  },
];

export default function AdminPage() {
  /* const [plans, setPlans] = useState<PricingPlan[]>(initialPlans); */
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
        return toast.success("Plan created successfully");
      }
      toast.error("Plan creation failed");
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
      toast.error("Plan deleted failed");
    },
  });
  const handleCreatePlan = (planData: CreatePlanRequest) => {
    const newPlan = {
      ...planData,

      /*       version: 1,
      active: true, */
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

    console.log("[v0] Updated plan:", updatedPlan);
  };

  const handleDeletePlan = (planId: string) => {
    DeleteFn(planId);
  };

  const handleViewPlan = (plan: PricingPlan) => {
    setViewingPlan(plan);
  };

  if (showForm) {
    return (
      <div className="container mx-auto py-8 px-4">
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
    );
  }

  if (viewingPlan) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plan Details: {viewingPlan.title}</CardTitle>
              <Button variant="outline" onClick={() => setViewingPlan(null)}>
                Back to Plans
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Title:</strong> {viewingPlan.title}
                  </p>
                  <p>
                    <strong>Description:</strong> {viewingPlan.description}
                  </p>
                  <p>
                    <strong>Price:</strong> $
                    {(viewingPlan.priceCents / 100).toFixed(2)}{" "}
                    {viewingPlan.currency}
                  </p>
                  <p>
                    <strong>Billing:</strong> {viewingPlan.billingUnit}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {viewingPlan.active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Metadata</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>ID:</strong> {viewingPlan._id}
                  </p>
                  <p>
                    <strong>Version:</strong> {viewingPlan.version}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(viewingPlan.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Updated:</strong>{" "}
                    {new Date(viewingPlan.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Permissions ({viewingPlan.permissions.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {viewingPlan.permissions.map((permission, index) => (
                  <div key={index} className="text-sm p-2 bg-muted rounded">
                    {permission}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Limits ({viewingPlan.limits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {viewingPlan.limits.map((limit, index) => (
                  <div key={index} className="text-sm p-2 bg-muted rounded">
                    <strong>{limit.key}:</strong>{" "}
                    {limit.limit === -1 ? "Unlimited" : limit.limit}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Pricing Plans Admin</h1>
          <p className="text-muted-foreground">
            Manage your pricing plans and permissions
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Plans Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{data?.data?.length}</div>
                <div className="text-sm text-muted-foreground">Total Plans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {data?.data?.filter((p) => p.active).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Plans
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  $
                  {data?.data &&
                    data?.data?.length > 0 &&
                    Math.min(
                      ...data.data.map((p) => p.priceCents / 100)
                    ).toFixed(0)}{" "}
                  - $
                  {data?.data &&
                    data?.data?.length > 0 &&
                    Math.max(
                      ...data.data.map((p) => p.priceCents / 100)
                    ).toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Price Range</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PlansTable
        plans={data?.data || []}
        onEdit={handleEditPlan}
        onDelete={handleDeletePlan}
        onView={handleViewPlan}
        isLoading={isDeleting}
      />
    </div>
  );
}
