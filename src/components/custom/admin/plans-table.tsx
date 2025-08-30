"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { PricingPlan } from "@/@types/pricing";
import {
  getFeatureDescription,
  getLimitDescription,
} from "@/@types/feature-mapping";

interface PlansTableProps {
  plans: PricingPlan[];
  onEdit: (plan: PricingPlan) => void;
  onDelete: (planId: string) => void;
  onView: (plan: PricingPlan) => void;
  isLoading?: boolean;
}

export function PlansTable({
  plans,
  onEdit,
  onDelete,
  onView,
  isLoading,
}: PlansTableProps) {
  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(priceCents / 100);
  };

  const formatBillingUnit = (unit: string) => {
    switch (unit) {
      case "PER_MONTH":
        return "/month";
      case "PER_YEAR":
        return "/year";
      case "PER_EVENT":
        return "/event";
      default:
        return `/${unit.toLowerCase()}`;
    }
  };

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <Card key={plan._id} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{plan.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={plan.active ? "default" : "secondary"}>
                  {plan.active ? "Active" : "Inactive"}
                </Badge>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatPrice(plan.priceCents, plan.currency)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {formatBillingUnit(plan.billingUnit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Permissions */}
              <div>
                <h4 className="font-semibold mb-2">
                  Permissions ({plan.permissions.length})
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {plan.permissions.map((permission, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {getFeatureDescription(permission)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Limits */}
              <div>
                <h4 className="font-semibold mb-2">
                  Limits ({plan.limits.length})
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {plan.limits.map((limit, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {getLimitDescription(limit.key)}:{" "}
                      {limit.limit === -1
                        ? "Unlimited"
                        : limit.limit.toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => onView(plan)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  onClick={() => onEdit(plan)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Plan
                </Button>
                <Button
                  onClick={() => onDelete(plan._id)}
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
