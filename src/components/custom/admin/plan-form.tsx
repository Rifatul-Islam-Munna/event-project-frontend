"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
  });

  const availablePermissions = Object.keys(featureMapping);
  const availableLimits = Object.keys(limitMapping);

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter((p) => p !== permission),
    }));
  };

  const addLimit = () => {
    setFormData((prev) => ({
      ...prev,
      limits: [...prev.limits, { key: "", limit: 0 }],
    }));
  };

  const updateLimit = (
    index: number,
    field: keyof PricingLimit,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      limits: prev.limits.map((limit, i) =>
        i === index ? { ...limit, [field]: value } : limit
      ),
    }));
  };

  const removeLimit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      limits: prev.limits.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Plan" : "Create New Plan"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Plan Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (cents)</Label>
              <Input
                id="price"
                type="number"
                value={formData.priceCents}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priceCents: Number.parseInt(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
            />
          </div>

          {/*   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing">Billing Unit</Label>
              <Select
                value={formData.billingUnit}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, billingUnit: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PER_MONTH">Per Month</SelectItem>
                  <SelectItem value="PER_YEAR">Per Year</SelectItem>
                  <SelectItem value="PER_EVENT">Per Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div> */}

          {/* Permissions */}
          <div className="space-y-4">
            <Label>Permissions</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
              {availablePermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(permission, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={permission}
                    className="text-sm cursor-pointer"
                  >
                    {featureMapping[permission as keyof typeof featureMapping]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Limits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Limits</Label>
              <Button
                type="button"
                onClick={addLimit}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Limit
              </Button>
            </div>
            <div className="space-y-3">
              {formData.limits.map((limit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <Select
                    value={limit.key}
                    onValueChange={(value) => updateLimit(index, "key", value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select limit type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLimits.map((limitKey) => (
                        <SelectItem key={limitKey} value={limitKey}>
                          {limitMapping[limitKey as keyof typeof limitMapping]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Limit value"
                    value={limit.limit}
                    onChange={(e) =>
                      updateLimit(
                        index,
                        "limit",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    className="w-32"
                  />
                  <Button
                    type="button"
                    onClick={() => removeLimit(index)}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              {initialData ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
