"use client";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Mail,
  Phone,
  CreditCard,
  Package,
  Lock,
  ShoppingCart,
  Sparkles,
  Euro,
  Check,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getForUser } from "@/actions/vendor-category-actions";
import { useRouter } from "next/navigation";

import { m, LazyMotion, domAnimation, AnimatePresence } from "motion/react";
import { useCheckoutStore } from "@/zustan-fn/checkout-store";

// ─── Types ────────────────────────────────────────────────────────────────────
enum AddOnType {
  message = "message",
  whatsapp = "whatsapp",
  email = "email",
  flushCard = "flushCard",
}

interface AddOn {
  _id: string;
  type: AddOnType;
  numberMessage: number;
  message: string;
  flushCardCoupon: string;
  price: number;
}

// ─── Type Config ──────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  [AddOnType.message]: {
    label: "Message",
    icon: MessageSquare,
    gradient: "from-blue-500 to-blue-600",
    softBg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    iconBg: "bg-blue-100 text-blue-600",
    glow: "hover:shadow-blue-200",
    btn: "from-blue-500 to-blue-600",
    priceBg: "bg-blue-50 border-blue-200 text-blue-700",
    selectedRing: "ring-blue-400",
  },
  [AddOnType.whatsapp]: {
    label: "WhatsApp",
    icon: Phone,
    gradient: "from-green-500 to-green-600",
    softBg: "bg-green-50",
    badge: "bg-green-100 text-green-700 border-green-200",
    iconBg: "bg-green-100 text-green-600",
    glow: "hover:shadow-green-200",
    btn: "from-green-500 to-green-600",
    priceBg: "bg-green-50 border-green-200 text-green-700",
    selectedRing: "ring-green-400",
  },
  [AddOnType.email]: {
    label: "Email",
    icon: Mail,
    gradient: "from-purple-500 to-purple-600",
    softBg: "bg-purple-50",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    iconBg: "bg-purple-100 text-purple-600",
    glow: "hover:shadow-purple-200",
    btn: "from-purple-500 to-purple-600",
    priceBg: "bg-purple-50 border-purple-200 text-purple-700",
    selectedRing: "ring-purple-400",
  },
  [AddOnType.flushCard]: {
    label: "Flush Card",
    icon: CreditCard,
    gradient: "from-orange-500 to-orange-600",
    softBg: "bg-orange-50",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    iconBg: "bg-orange-100 text-orange-600",
    glow: "hover:shadow-orange-200",
    btn: "from-orange-500 to-orange-600",
    priceBg: "bg-orange-50 border-orange-200 text-orange-700",
    selectedRing: "ring-orange-400",
  },
} as const;

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden animate-pulse">
      <div className="h-1.5 w-full bg-slate-200" />
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="h-12 w-12 rounded-xl bg-slate-200" />
          <div className="h-5 w-20 rounded-full bg-slate-200" />
        </div>
        <div className="h-5 w-32 bg-slate-200 rounded mt-3" />
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
        <div className="h-10 w-full bg-slate-100 rounded-lg" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="h-3 w-4/5 bg-slate-100 rounded" />
        </div>
        <div className="h-11 w-full bg-slate-200 rounded-lg mt-2" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddOnCards() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["add-ons"],
    queryFn: () => getForUser(),
    staleTime: 5 * 60 * 1000,
  });

  const router = useRouter();
  const { addonIds, toggleAddon } = useCheckoutStore();
  const addOns: AddOn[] = data?.data ?? [];
  const selectedCount = addonIds.length;

  // ── Error State ──────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-slate-600 font-medium">Failed to load add-ons</p>
        <p className="text-slate-400 text-sm mt-1">Please try again later</p>
      </div>
    );
  }

  // ── Empty State ──────────────────────────────────────────────────────────
  if (!isLoading && addOns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">No add-ons available</p>
        <p className="text-slate-400 text-sm mt-1">Check back soon</p>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-5 pb-28">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : addOns.map((addOn) => {
              const config = TYPE_CONFIG[addOn.type];
              const Icon = config?.icon ?? Package;
              const isFlushCard = addOn.type === AddOnType.flushCard;
              const isSelected = addonIds.includes(addOn._id);

              return (
                <m.div
                  key={addOn._id}
                  layout
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  <Card
                    className={cn(
                      "group relative overflow-hidden border-slate-200 bg-white rounded-2xl",
                      "shadow-md hover:shadow-xl transition-all duration-300",
                      config?.glow,
                      isSelected &&
                        `ring-2 ${config?.selectedRing} scale-[1.02] shadow-lg`,
                    )}
                  >
                    {/* ── Selected checkmark overlay ── */}
                    <AnimatePresence>
                      {isSelected && (
                        <m.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute top-3 right-3 z-20 h-7 w-7 rounded-full bg-lime-500 flex items-center justify-center shadow-md"
                        >
                          <Check className="h-4 w-4 text-white" />
                        </m.div>
                      )}
                    </AnimatePresence>

                    {/* ── Top accent bar ── */}
                    <div
                      className={cn(
                        "h-1.5 w-full bg-gradient-to-r",
                        config?.gradient,
                      )}
                    />

                    <CardHeader className="pt-5 px-6 pb-2">
                      <div className="flex items-start justify-between">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm",
                            config?.iconBg,
                          )}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <Badge
                          className={cn(
                            "text-xs font-semibold border",
                            config?.badge,
                          )}
                        >
                          {config?.label}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-4 leading-tight">
                        {config?.label} Add-On
                      </h3>
                    </CardHeader>

                    <CardContent className="px-6 pb-4 space-y-3">
                      {/* ── Price ── */}
                      <div
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl border",
                          config?.priceBg,
                        )}
                      >
                        <span className="text-sm font-medium opacity-80">
                          Price
                        </span>
                        <span className="flex items-center gap-1 text-xl font-extrabold tracking-tight">
                          <Euro className="h-4 w-4" />
                          {addOn.price != null
                            ? addOn.price.toFixed(2)
                            : "0.00"}
                        </span>
                      </div>

                      {/* ── Message / WhatsApp / Email ── */}
                      {!isFlushCard && (
                        <>
                          {addOn.numberMessage > 0 && (
                            <div
                              className={cn(
                                "flex items-center gap-2 px-3 py-2.5 rounded-xl",
                                config?.softBg,
                              )}
                            >
                              <Sparkles className="h-4 w-4 text-slate-500 shrink-0" />
                              <span className="text-sm font-semibold text-slate-700">
                                {addOn.numberMessage.toLocaleString()} messages
                                included
                              </span>
                            </div>
                          )}
                          {addOn.message && (
                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 min-h-[3.75rem]">
                              {addOn.message}
                            </p>
                          )}
                        </>
                      )}

                      {/* ── Flush Card ── */}
                      {isFlushCard && (
                        <div className="space-y-3">
                          {addOn.message ? (
                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                              {addOn.message}
                            </p>
                          ) : (
                            <p className="text-sm text-slate-500 leading-relaxed">
                              Purchase to unlock your exclusive coupon code
                              instantly.
                            </p>
                          )}
                          <div className="relative flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl overflow-hidden">
                            <Lock className="h-4 w-4 text-orange-400 shrink-0 relative z-10" />
                            <span
                              className="font-mono font-bold tracking-widest text-sm text-slate-800 select-none blur-sm"
                              aria-hidden="true"
                            >
                              {addOn.flushCardCoupon || "XXXXXXXXXXXX"}
                            </span>
                            <div className="absolute inset-0 bg-orange-50/40 backdrop-blur-[2px]" />
                          </div>
                          <p className="text-xs text-orange-500 font-medium flex items-center gap-1.5">
                            <Lock className="h-3 w-3" />
                            Revealed after purchase
                          </p>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="px-6 pb-6 pt-0">
                      <Button
                        onClick={() => toggleAddon(addOn._id)}
                        className={cn(
                          "w-full h-11 font-semibold transition-all duration-200",
                          isSelected
                            ? "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            : cn(
                                "text-white bg-gradient-to-r shadow-sm hover:opacity-90 active:scale-[0.98]",
                                config?.btn,
                              ),
                        )}
                        variant={isSelected ? "outline" : "default"}
                      >
                        {isSelected ? (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </m.div>
              );
            })}
      </div>

      {/* ── Floating Checkout Bar ── */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <m.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
          >
            <div className="flex items-center justify-between gap-4 bg-white border border-lime-200 rounded-2xl shadow-2xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-lime-100 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-lime-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedCount} add-on{selectedCount > 1 ? "s" : ""}{" "}
                    selected
                  </p>
                  <p className="text-xs text-slate-500">Ready to checkout</p>
                </div>
              </div>
              <Button
                onClick={() => router.push("/checkout")}
                className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-bold px-5 h-11 rounded-xl shadow-lg shadow-lime-200 transition-all"
              >
                Checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
