"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CreateSubWithAddOn } from "@/actions/fetch-action";
import { useCheckoutStore } from "@/zustan-fn/checkout-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CreditCard,
  Shield,
  ArrowLeft,
  Sparkles,
  Euro,
  Package,
  Zap,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  { developerTools: { assistant: { enabled: true } } },
);

// ─── Inner form ───────────────────────────────────────────────────────────────
function CheckoutForm({
  clientSecret,
  finalAmount,
}: {
  clientSecret: string;
  finalAmount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCheckout } = useCheckoutStore();

  const confirmPay = useMutation({
    mutationKey: ["confirm-pay"],
    mutationFn: async () => {
      if (!stripe || !elements) throw new Error("Stripe not ready");

      const { error: submitError } = await elements.submit();
      if (submitError)
        throw new Error(submitError.message ?? "Form submit failed");

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/payment/confirm`,
        },
        redirect: "always",
      });

      if (error) throw new Error(error.message ?? "Payment failed");
    },
    onSuccess: () => clearCheckout(),
    onError: (e: Error) => alert(e.message ?? "Payment error"),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        confirmPay.mutate();
      }}
      className="space-y-5"
    >
      {/* Stripe Element */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {/* Amount reminder */}
      <div className="flex items-center justify-between px-4 py-3 bg-lime-50 border border-lime-200 rounded-xl">
        <span className="text-sm font-semibold text-slate-700">
          Amount due today
        </span>
        <span className="text-xl font-extrabold text-lime-700 flex items-center gap-1">
          <Euro className="h-4 w-4" />
          {(finalAmount / 100).toFixed(2)}
        </span>
      </div>

      {/* Pay button */}
      <Button
        type="submit"
        disabled={!stripe || confirmPay.isPending}
        className={cn(
          "w-full h-13 text-base font-bold text-white rounded-xl",
          "bg-gradient-to-r from-lime-500 via-lime-600 to-lime-700",
          "shadow-lg shadow-lime-200 hover:shadow-xl hover:shadow-lime-300",
          "hover:from-lime-600 hover:to-lime-800 transition-all duration-300",
          "disabled:opacity-60 disabled:cursor-not-allowed",
        )}
        size="lg"
      >
        {confirmPay.isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay € {(finalAmount / 100).toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
        <Shield className="h-3.5 w-3.5" />
        256-bit SSL encrypted · Secured by Stripe
      </p>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaymentPage() {
  const router = useRouter();
  const { planId, addonIds, couponCode, clearCheckout } = useCheckoutStore();

  // ── Guard: redirect if store is empty ─────────────────────────────────────
  useEffect(() => {
    if (!planId) router.replace("/checkout");
  }, [planId, router]);

  // ── Create payment intent from store values ────────────────────────────────
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["create-intent", planId, addonIds, couponCode],
    queryFn: () => CreateSubWithAddOn(planId!, couponCode, addonIds),

    enabled: !!planId,
    staleTime: 0,
    retry: false,
  });

  const clientSecret = data?.data?.key;
  const customerSessionSecret = data?.data?.customerSessionSecret;
  const finalAmount = data?.data?.finalAmount ?? 0;
  const breakdown = data?.data?.breakdown;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading || !planId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-lime-50/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-lime-200 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-14">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center mb-5 shadow-lg shadow-lime-200">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Setting up your payment
            </h3>
            <p className="text-sm text-slate-500 text-center">
              Please wait while we prepare your secure checkout...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-lime-50/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-14">
            <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mb-5">
              <CreditCard className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Payment Setup Failed
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              {(error as Error)?.message || "Failed to initialize payment"}
            </p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-lime-300 text-lime-700 hover:bg-lime-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-lime-50/30">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-lime-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
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
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Secure Checkout
            </h1>
          </div>
          <Badge className="ml-auto bg-lime-100 text-lime-700 border-lime-200 font-semibold">
            <Shield className="h-3 w-3 mr-1" />
            SSL Secured
          </Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── LEFT: Payment form ─────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <Card className="border-lime-200 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  Payment Details
                </CardTitle>
                <CardDescription className="text-lime-100 text-sm">
                  Your payment is encrypted and secure
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    customerSessionClientSecret: customerSessionSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#84cc16",
                        colorBackground: "#ffffff",
                        borderRadius: "12px",
                        fontFamily: "inherit",
                      },
                    },
                  }}
                >
                  <CheckoutForm
                    clientSecret={clientSecret}
                    finalAmount={finalAmount}
                  />
                </Elements>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT: Order summary ───────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <Card className="border-lime-200 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-4">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Plan row */}
                  {breakdown?.planOriginal != null && (
                    <div className="flex items-center gap-3 p-3 bg-lime-50 border border-lime-200 rounded-xl">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center shrink-0">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          Selected Plan
                        </p>
                        <p className="text-xs text-slate-500">12 months</p>
                      </div>
                      <span className="text-sm font-extrabold text-slate-900 shrink-0">
                        € {(breakdown.planOriginal / 100).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Add-on rows */}
                  {breakdown?.addOnsApplied?.length > 0 && (
                    <div className="space-y-2">
                      {breakdown.addOnsApplied.map(
                        (a: {
                          id: string;
                          type: string;
                          priceCents: number;
                        }) => (
                          <div
                            key={a.id}
                            className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                          >
                            <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Sparkles className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 capitalize truncate">
                                {a.type} Add-On
                              </p>
                              <Badge className="text-xs bg-slate-100 text-slate-600 border-slate-200 mt-0.5">
                                Add-On
                              </Badge>
                            </div>
                            <span className="text-sm font-extrabold text-slate-900 shrink-0">
                              € {(a.priceCents / 100).toFixed(2)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  <Separator className="bg-slate-100" />

                  {/* Coupon */}
                  {couponCode && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Tag className="h-3.5 w-3.5 text-lime-600" />
                        Coupon
                      </span>
                      <Badge className="bg-lime-100 text-lime-700 border-lime-200 font-mono font-bold">
                        {couponCode}
                      </Badge>
                    </div>
                  )}

                  {/* Discount */}
                  {breakdown?.planOriginal != null &&
                    breakdown.planAfterCoupon < breakdown.planOriginal && (
                      <div className="flex items-center justify-between text-sm text-green-600">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          Discount applied
                        </span>
                        <span className="font-semibold">
                          - €{" "}
                          {(
                            (breakdown.planOriginal -
                              breakdown.planAfterCoupon) /
                            100
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}

                  <Separator className="bg-lime-100" />

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900">
                      Total
                    </span>
                    <span className="text-2xl font-extrabold text-lime-700 flex items-center gap-1">
                      <Euro className="h-5 w-5" />
                      {(finalAmount / 100).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* ── Trust badges ── */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Shield, label: "Secure" },
                  { icon: Zap, label: "Instant" },
                  { icon: CheckCircle2, label: "Verified" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-slate-100 text-center"
                  >
                    <div className="h-7 w-7 rounded-lg bg-lime-50 flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 text-lime-600" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
