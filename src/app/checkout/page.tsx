"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { m, LazyMotion, domAnimation, AnimatePresence } from "motion/react";

import { createFreePlan, getAllThePlans } from "@/actions/fetch-action";
import { getForUser } from "@/actions/vendor-category-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Tag,
  ShoppingCart,
  Sparkles,
  Check,
  Package,
  CreditCard,
  Euro,
  ChevronRight,
  Shield,
  Zap,
  MessageSquare,
  Phone,
  Mail,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCheckoutStore } from "@/zustan-fn/checkout-store";
import { toast } from "sonner";

// ─── Addon type config ────────────────────────────────────────────────────────
const ADDON_CONFIG: Record<
  string,
  {
    icon: React.ElementType;
    iconBg: string;
    badge: string;
    border: string;
    selectedBg: string;
  }
> = {
  message: {
    icon: MessageSquare,
    iconBg: "bg-blue-100 text-blue-600",
    badge: "bg-blue-50 text-blue-600 border-blue-200",
    border: "border-blue-200",
    selectedBg: "bg-blue-50",
  },
  whatsapp: {
    icon: Phone,
    iconBg: "bg-green-100 text-green-600",
    badge: "bg-green-50 text-green-600 border-green-200",
    border: "border-green-200",
    selectedBg: "bg-green-50",
  },
  email: {
    icon: Mail,
    iconBg: "bg-purple-100 text-purple-600",
    badge: "bg-purple-50 text-purple-600 border-purple-200",
    border: "border-purple-200",
    selectedBg: "bg-purple-50",
  },
  flushCard: {
    icon: CreditCard,
    iconBg: "bg-orange-100 text-orange-600",
    badge: "bg-orange-50 text-orange-600 border-orange-200",
    border: "border-orange-200",
    selectedBg: "bg-orange-50",
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const {
    planId,
    addonIds,
    couponCode,
    setCouponCode,
    toggleAddon,
    clearCheckout,
  } = useCheckoutStore();

  const [couponInput, setCouponInput] = useState(couponCode);

  const handleCouponChange = (val: string) => {
    const upper = val.toUpperCase();
    setCouponInput(upper);
    setCouponCode(upper);
  };

  // ── Fetch plan ──────────────────────────────────────────────────────────────
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getAllThePlans(),
    enabled: !!planId,
    staleTime: 5 * 60 * 1000,
  });

  // ── Fetch ALL add-ons (always) ──────────────────────────────────────────────
  const { data: addOnsData, isLoading: addOnsLoading } = useQuery({
    queryKey: ["add-ons"],
    queryFn: () => getForUser(),
    staleTime: 5 * 60 * 1000,
  });

  const selectedPlan = useMemo(
    () => plansData?.data?.find((p) => p._id === planId) ?? null,
    [plansData, planId],
  );

  // ── ALL available add-ons (for selection) ──────────────────────────────────
  const allAddOns: any[] = addOnsData?.data ?? [];

  // ── Only selected add-ons (for price calculation) ─────────────────────────
  const selectedAddOns = useMemo(
    () => allAddOns.filter((a) => addonIds.includes(a._id)),
    [allAddOns, addonIds],
  );

  // ── Price ──────────────────────────────────────────────────────────────────
  const planPrice = selectedPlan ? selectedPlan.priceCents / 100 : 0;
  const addOnsTotal = selectedAddOns.reduce(
    (acc: number, a: any) => acc + (a.price ?? 0),
    0,
  );
  const subtotal = planPrice + addOnsTotal;
  const discount = 0; // TODO: real coupon API
  const total = Math.max(0, subtotal - discount);

  const formatEur = (val: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(val);

  const isLoading = (!!planId && plansLoading) || addOnsLoading;
  const hasItems = !!planId || addonIds.length > 0;
  const { mutate, isPending } = useMutation({
    mutationKey: ["checkout-free"],
    mutationFn: () => createFreePlan(planId!, couponCode, addonIds),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data?.message);
        return;
      }
      router.push("/checkout/free-plan");
    },
  });
  const handlePay = () => {
    if (subtotal === 0) {
      mutate();
      return;
    }
    router.push(`/checkout/payment`);
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-lime-50/30">
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-lime-100">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-xl hover:bg-lime-50 text-slate-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Checkout</h1>
            </div>
            <AnimatePresence>
              {hasItems && (
                <m.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="ml-auto"
                >
                  <Badge className="bg-lime-100 text-lime-700 border-lime-200 font-semibold">
                    {(planId ? 1 : 0) + addonIds.length} item
                    {(planId ? 1 : 0) + addonIds.length !== 1 ? "s" : ""}
                  </Badge>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* ── Empty State ── */}
          {!isLoading && !hasItems && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="h-20 w-20 rounded-2xl bg-lime-100 flex items-center justify-center mb-6">
                <ShoppingCart className="h-10 w-10 text-lime-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Your cart is empty
              </h2>
              <p className="text-slate-500 mb-8">
                Select a plan to get started
              </p>
              <Button
                onClick={() => router.push("/#pricing")}
                className="bg-gradient-to-r from-lime-500 to-lime-600 text-white font-semibold px-6 h-11 rounded-xl"
              >
                Browse Plans
              </Button>
            </m.div>
          )}

          {/* ── Main Layout ── */}
          {(isLoading || hasItems) && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* ── LEFT COL ─────────────────────────────────────────────── */}
              <div className="lg:col-span-3 space-y-8">
                {/* ── 1. Selected Plan ── */}
                <m.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-lime-600" />
                    Order Items
                  </h2>

                  {!!planId && (
                    <>
                      {plansLoading ? (
                        <SkeletonItem />
                      ) : selectedPlan ? (
                        <m.div
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-4 bg-white border-2 border-lime-200 rounded-2xl p-4 shadow-sm"
                        >
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center shrink-0 shadow-md shadow-lime-200">
                            <Zap className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-slate-900 truncate">
                                {selectedPlan.title}
                              </p>
                              <Badge className="bg-lime-100 text-lime-700 border-lime-200 text-xs">
                                Plan
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 truncate mt-0.5">
                              {selectedPlan.description}
                            </p>
                          </div>
                          <span className="font-extrabold text-slate-900 text-lg shrink-0">
                            {formatEur(planPrice)}
                          </span>
                        </m.div>
                      ) : null}
                    </>
                  )}
                </m.div>

                {/* ── 2. Add-Ons Selection ────────────────────────────────── */}
                <m.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-lime-600" />
                      Enhance with Add-Ons
                      <span className="text-sm font-normal text-slate-400">
                        (optional)
                      </span>
                    </h2>
                    {addonIds.length > 0 && (
                      <Badge className="bg-lime-100 text-lime-700 border-lime-200 text-xs font-semibold">
                        {addonIds.length} selected
                      </Badge>
                    )}
                  </div>

                  {addOnsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <SkeletonAddon key={i} />
                      ))}
                    </div>
                  ) : allAddOns.length === 0 ? (
                    <div className="flex items-center gap-3 px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-500">
                      <Package className="h-4 w-4 shrink-0" />
                      No add-ons available right now
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {allAddOns.map((addOn: any, i: number) => {
                        const config =
                          ADDON_CONFIG[addOn.type as string] ??
                          ADDON_CONFIG["message"];
                        const Icon = config.icon;
                        const isSelected = addonIds.includes(addOn._id);

                        return (
                          <m.div
                            key={addOn._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            layout
                          >
                            <button
                              type="button"
                              onClick={() => toggleAddon(addOn._id)}
                              className={cn(
                                "w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 group",
                                isSelected
                                  ? cn(
                                      "border-lime-400 bg-lime-50 shadow-md shadow-lime-100",
                                    )
                                  : "border-slate-200 bg-white hover:border-lime-300 hover:shadow-sm",
                              )}
                            >
                              <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div
                                  className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                    isSelected
                                      ? "bg-lime-100 text-lime-600"
                                      : config.iconBg,
                                  )}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p
                                      className={cn(
                                        "font-bold text-sm capitalize",
                                        isSelected
                                          ? "text-lime-800"
                                          : "text-slate-800",
                                      )}
                                    >
                                      {addOn.type} Add-On
                                    </p>
                                    {/* Toggle indicator */}
                                    <div
                                      className={cn(
                                        "h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200",
                                        isSelected
                                          ? "bg-lime-500 text-white scale-110"
                                          : "bg-slate-100 text-slate-400 group-hover:bg-lime-100 group-hover:text-lime-500",
                                      )}
                                    >
                                      {isSelected ? (
                                        <Check className="h-3.5 w-3.5" />
                                      ) : (
                                        <Plus className="h-3.5 w-3.5" />
                                      )}
                                    </div>
                                  </div>

                                  {addOn.numberMessage > 0 && (
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {addOn.numberMessage.toLocaleString()}{" "}
                                      messages included
                                    </p>
                                  )}

                                  {addOn.message && (
                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                      {addOn.message}
                                    </p>
                                  )}

                                  <div
                                    className={cn(
                                      "mt-2 inline-flex items-center gap-1 text-sm font-extrabold",
                                      isSelected
                                        ? "text-lime-700"
                                        : "text-slate-700",
                                    )}
                                  >
                                    <Euro className="h-3.5 w-3.5" />
                                    {(addOn.price ?? 0).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </button>
                          </m.div>
                        );
                      })}
                    </div>
                  )}
                </m.div>

                {/* ── Trust badges ── */}
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-3 gap-3"
                >
                  {[
                    { icon: Shield, label: "Secure Payment" },
                    { icon: Zap, label: "Instant Access" },
                    { icon: Check, label: "No Hidden Fees" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 text-center"
                    >
                      <div className="h-8 w-8 rounded-lg bg-lime-50 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-lime-600" />
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {label}
                      </span>
                    </div>
                  ))}
                </m.div>
              </div>

              {/* ── RIGHT COL: Summary ─────────────────────────────────────── */}
              <m.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="lg:col-span-2"
              >
                <div className="sticky top-24 bg-white border border-lime-200 rounded-2xl shadow-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-4">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Order Summary
                    </h2>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Line items */}
                    <div className="space-y-2.5">
                      {isLoading ? (
                        <>
                          <SkeletonLine />
                          <SkeletonLine short />
                        </>
                      ) : (
                        <>
                          {selectedPlan && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600 truncate mr-2">
                                {selectedPlan.title}
                              </span>
                              <span className="font-semibold text-slate-900 shrink-0">
                                {formatEur(planPrice)}
                              </span>
                            </div>
                          )}
                          <AnimatePresence>
                            {selectedAddOns.map((a: any) => (
                              <m.div
                                key={a._id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex justify-between text-sm overflow-hidden"
                              >
                                <span className="text-slate-600 capitalize truncate mr-2 flex items-center gap-1.5">
                                  <Sparkles className="h-3 w-3 text-lime-500 shrink-0" />
                                  {a.type} Add-On
                                </span>
                                <span className="font-semibold text-slate-900 shrink-0">
                                  {formatEur(a.price ?? 0)}
                                </span>
                              </m.div>
                            ))}
                          </AnimatePresence>
                        </>
                      )}
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* Subtotal */}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-900">
                        {formatEur(subtotal)}
                      </span>
                    </div>

                    {/* Coupon — no Apply button */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <Tag className="h-4 w-4 text-lime-600" />
                        Coupon Code
                      </label>
                      <div className="relative">
                        <Input
                          value={couponInput}
                          onChange={(e) => handleCouponChange(e.target.value)}
                          placeholder="Enter code..."
                          className="font-mono uppercase text-sm h-10 border-slate-200 focus-visible:ring-lime-500 bg-slate-50 pr-10"
                        />
                        {couponInput && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Check className="h-4 w-4 text-lime-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          Discount
                        </span>
                        <span className="font-semibold">
                          -{formatEur(discount)}
                        </span>
                      </div>
                    )}

                    <Separator className="bg-lime-100" />

                    {/* Total — animates on add-on toggle */}
                    <m.div
                      key={total}
                      initial={{ scale: 0.97 }}
                      animate={{ scale: 1 }}
                      className="flex justify-between items-center"
                    >
                      <span className="text-base font-bold text-slate-900">
                        Total
                      </span>
                      <span className="text-2xl font-extrabold text-lime-700 flex items-center gap-1">
                        <Euro className="h-5 w-5" />
                        {total.toFixed(2)}
                      </span>
                    </m.div>

                    {/* Pay button */}
                    <Button
                      onClick={handlePay}
                      disabled={!hasItems || isLoading || isPending}
                      className={cn(
                        "w-full h-12 text-base font-bold text-white rounded-xl",
                        "bg-gradient-to-r from-lime-500 via-lime-600 to-lime-700",
                        "shadow-lg shadow-lime-200 hover:shadow-xl hover:shadow-lime-300",
                        "hover:from-lime-600 hover:to-lime-800 transition-all duration-300",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                      )}
                      size="lg"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Proceed to Payment
                      <ChevronRight className="h-5 w-5 ml-1" />
                    </Button>

                    <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                      <Shield className="h-3 w-3" />
                      256-bit SSL encrypted & secure
                    </p>
                  </div>
                </div>
              </m.div>
            </div>
          )}
        </div>
      </div>
    </LazyMotion>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
function SkeletonItem() {
  return (
    <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 animate-pulse">
      <div className="h-12 w-12 rounded-xl bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="h-3 w-48 bg-slate-100 rounded" />
      </div>
      <div className="h-6 w-16 bg-slate-200 rounded" />
    </div>
  );
}

function SkeletonAddon() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-24 bg-slate-200 rounded" />
          <div className="h-3 w-32 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="h-4 w-16 bg-slate-100 rounded" />
    </div>
  );
}

function SkeletonLine({ short }: { short?: boolean }) {
  return (
    <div className="flex justify-between animate-pulse">
      <div
        className={cn("h-3 bg-slate-100 rounded", short ? "w-20" : "w-32")}
      />
      <div className="h-3 w-14 bg-slate-100 rounded" />
    </div>
  );
}
