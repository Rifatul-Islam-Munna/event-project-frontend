"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Trash2, Star, Hash } from "lucide-react";
import { featureMapping, limitMapping } from "@/@types/feature-mapping";
import { CreatePlanRequest, PricingLimit } from "@/@types/pricing";

interface PlanFormProps {
  onSubmit: (plan: CreatePlanRequest) => void;
  onCancel: () => void;
  initialData?: Partial<CreatePlanRequest>;
  isPending?: boolean;
}

export function PlanForm({
  onSubmit,
  onCancel,
  initialData,
  isPending,
}: PlanFormProps) {
  const [formData, setFormData] = useState<CreatePlanRequest>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    priceCents: initialData?.priceCents || 0,
    currency: initialData?.currency || "USD",
    billingUnit: initialData?.billingUnit || "PER_MONTH",
    permissions: initialData?.permissions || [],
    limits: initialData?.limits || [],
    type: initialData?.type || "",
    order: initialData?.order || 1, // ✅ NEW
    isPopular: initialData?.isPopular || false, // ✅ NEW
  });

  const availablePermissions = Object.keys(featureMapping);
  const availableLimits = Object.keys(limitMapping);

  const setField = (key: keyof CreatePlanRequest, value: unknown) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setField(
      "permissions",
      checked
        ? [...formData.permissions, permission]
        : formData.permissions.filter((p) => p !== permission),
    );
  };

  const addLimit = () =>
    setField("limits", [...formData.limits, { key: "", limit: 0 }]);

  const updateLimit = (
    index: number,
    field: keyof PricingLimit,
    value: string | number,
  ) => {
    setField(
      "limits",
      formData.limits.map((limit, i) =>
        i === index ? { ...limit, [field]: value } : limit,
      ),
    );
  };

  const removeLimit = (index: number) =>
    setField(
      "limits",
      formData.limits.filter((_, i) => i !== index),
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
        <CardTitle className="text-xl font-semibold text-slate-900">
          {initialData?.title
            ? `Edit — ${initialData.title}`
            : "Create New Plan"}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Row 1: Title + Price ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-slate-900"
              >
                Plan Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. Pro Plan"
                className="h-11 border-slate-300 focus-visible:ring-lime-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="price"
                className="text-sm font-medium text-slate-900"
              >
                Price (cents) *
                <span className="text-slate-400 font-normal ml-1">
                  — e.g. 1900 = €19.00
                </span>
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.priceCents}
                onChange={(e) =>
                  setField("priceCents", parseInt(e.target.value) || 0)
                }
                placeholder="1900"
                className="h-11 border-slate-300 focus-visible:ring-lime-500"
                required
              />
            </div>
          </div>

          {/* ── Row 2: Order + Plan Type ──────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ✅ Order */}
            <div className="space-y-2">
              <Label
                htmlFor="order"
                className="text-sm font-medium text-slate-900 flex items-center gap-1.5"
              >
                <Hash className="h-3.5 w-3.5 text-slate-500" />
                Display Order *
              </Label>
              <Input
                id="order"
                type="number"
                min={1}
                value={formData.order}
                onChange={(e) =>
                  setField("order", parseInt(e.target.value) || "")
                }
                placeholder="1 = first, 2 = second..."
                className="h-11 border-slate-300 focus-visible:ring-lime-500"
                required
              />
            </div>

            {/* Plan Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">
                Plan Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setField("type", value)}
              >
                <SelectTrigger className="h-11 border-slate-300 focus:ring-lime-500">
                  <SelectValue placeholder="Select plan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Plan Type</SelectLabel>
                    <SelectItem value="Event package">Event Package</SelectItem>
                    <SelectItem value="Planer package">
                      Planner Package
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Description ──────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-slate-900"
            >
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Describe what this plan offers..."
              className="border-slate-300 focus-visible:ring-lime-500 resize-none"
              rows={3}
              required
            />
          </div>

          {/* ✅ isPopular Toggle ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Mark as Popular
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adds a "Most Popular" badge and highlights this plan on the
                  pricing page
                </p>
              </div>
            </div>
            <Switch
              checked={formData.isPopular}
              onCheckedChange={(v) => setField("isPopular", v)}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>

          {/* ── Permissions ──────────────────────────────────────────────── */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-900">
              Permissions
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({formData.permissions.length} selected)
              </span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              {availablePermissions.map((permission) => (
                <div
                  key={permission}
                  onClick={() =>
                    handlePermissionChange(
                      permission,
                      !formData.permissions.includes(permission),
                    )
                  }
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    formData.permissions.includes(permission)
                      ? "bg-lime-50 border-lime-300"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Checkbox
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(permission, checked as boolean)
                    }
                    className="data-[state=checked]:bg-lime-600 data-[state=checked]:border-lime-600"
                  />
                  <Label
                    htmlFor={permission}
                    className={`text-xs cursor-pointer font-medium ${
                      formData.permissions.includes(permission)
                        ? "text-lime-700"
                        : "text-slate-600"
                    }`}
                  >
                    {featureMapping[permission as keyof typeof featureMapping]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* ── Limits ───────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-slate-900">
                Resource Limits
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({formData.limits.length} added)
                </span>
              </Label>
              <Button
                type="button"
                onClick={addLimit}
                size="sm"
                variant="outline"
                className="h-8 border-slate-300 hover:bg-lime-50 hover:border-lime-300 hover:text-lime-700"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Limit
              </Button>
            </div>

            {formData.limits.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-sm text-slate-400">No limits added yet.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click "Add Limit" to add resource limits.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {formData.limits.map((limit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <Select
                      value={limit.key}
                      onValueChange={(value) =>
                        updateLimit(index, "key", value)
                      }
                    >
                      <SelectTrigger className="flex-1 h-9 border-slate-300 bg-white">
                        <SelectValue placeholder="Select limit type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLimits.map((limitKey) => (
                          <SelectItem key={limitKey} value={limitKey}>
                            {
                              limitMapping[
                                limitKey as keyof typeof limitMapping
                              ]
                            }
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Value (-1 = unlimited)"
                      value={limit.limit}
                      onChange={(e) =>
                        updateLimit(
                          index,
                          "limit",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-40 h-9 border-slate-300 bg-white focus-visible:ring-lime-500"
                    />
                    <Button
                      type="button"
                      onClick={() => removeLimit(index)}
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 p-0 border-slate-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Actions ──────────────────────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-lime-600 hover:bg-lime-700 text-white min-w-[130px]"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </div>
              ) : initialData?.title ? (
                "Update Plan"
              ) : (
                "Create Plan"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
