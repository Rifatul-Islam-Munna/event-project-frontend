"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  CheckoutProvider,
  CurrencySelectorElement,
  PaymentElement,
  useCheckout,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getInvoiceValidationErrors } from "@/@types/invoice";
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
  Package,
  Zap,
  Tag,
  CheckCircle2,
  Globe2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  { developerTools: { assistant: { enabled: true } } },
);

function formatFallbackEur(cents: number) {
  return `€ ${(cents / 100).toFixed(2)}`;
}

function CheckoutPane({
  fallbackTotalCents,
  fallbackBreakdown,
  couponCode,
}: {
  fallbackTotalCents: number;
  fallbackBreakdown: {
    planOriginal: number | null;
    planAfterCoupon: number | null;
    addOnsApplied: Array<{
      id: string;
      type: string;
      priceCents: number;
    }>;
  };
  couponCode?: string | null;
}) {
  const checkout = useCheckout();
  const router = useRouter();
  const [hideCurrencySelector, setHideCurrencySelector] = useState(false);
  const hasCurrencyOptions = (checkout.currencyOptions?.length ?? 0) > 0;

  const lineItems = checkout.lineItems ?? [];
  const totalLabel = checkout.total?.total?.amount ?? formatFallbackEur(fallbackTotalCents);
  const selectedCurrency = checkout.currency?.toUpperCase() ?? "EUR";

  const confirmPay = useMutation({
    mutationKey: ["confirm-custom-checkout"],
    mutationFn: async () => {
      const result = await checkout.confirm({
        returnUrl: `${window.location.origin}/checkout/payment/confirm?session_id={CHECKOUT_SESSION_ID}`,
        redirect: "if_required",
      });

      if (result.type === "error") {
        throw new Error(result.error.message ?? "Payment failed");
      }

      router.push(
        `/checkout/payment/confirm?session_id=${encodeURIComponent(result.session.id)}`,
      );
    },
    onError: (e: Error) => alert(e.message ?? "Payment error"),
  });

  const fallbackItems = [
    ...(fallbackBreakdown.planOriginal != null
      ? [
          {
            id: "plan",
            name: "Selected Plan",
            total: { amount: formatFallbackEur(fallbackBreakdown.planOriginal) },
          },
        ]
      : []),
    ...fallbackBreakdown.addOnsApplied.map((item) => ({
      id: item.id,
      name: `${item.type} Add-On`,
      total: { amount: formatFallbackEur(item.priceCents) },
    })),
  ];

  const displayItems = lineItems.length > 0 ? lineItems : fallbackItems;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <Card className="border-lime-200 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-4">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Payment Details
            </CardTitle>
            <CardDescription className="text-lime-100 text-sm">
              Stripe can show the local payment currency from the buyer location, with EUR still available.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {!hideCurrencySelector && hasCurrencyOptions ? (
              <div className="rounded-xl border border-lime-200 bg-lime-50/70 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Globe2 className="h-4 w-4 text-lime-600" />
                  Choose payment currency
                </div>
                <p className="mb-3 text-xs text-slate-500">
                  Stripe will suggest the local currency from the buyer location and keep EUR as the fallback option.
                </p>
                <CurrencySelectorElement
                  onLoadError={() => setHideCurrencySelector(true)}
                />
              </div>
            ) : null}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmPay.mutate();
              }}
              className="space-y-5"
            >
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <PaymentElement options={{ layout: "tabs" }} />
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-lime-50 border border-lime-200 rounded-xl">
                <span className="text-sm font-semibold text-slate-700">
                  Amount due today
                </span>
                <span className="text-xl font-extrabold text-lime-700">
                  {totalLabel}
                </span>
              </div>

              <Button
                type="submit"
                disabled={confirmPay.isPending}
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
                    Pay {totalLabel}
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                256-bit SSL encrypted · Secured by Stripe
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

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
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Payment currency</span>
                <Badge className="bg-lime-100 text-lime-700 border-lime-200 font-semibold">
                  {selectedCurrency}
                </Badge>
              </div>

              <div className="space-y-2">
                {displayItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 capitalize truncate">
                        {item.name}
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900 shrink-0">
                      {item.total.amount}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="bg-slate-100" />

              {couponCode ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Tag className="h-3.5 w-3.5 text-lime-600" />
                    Coupon
                  </span>
                  <Badge className="bg-lime-100 text-lime-700 border-lime-200 font-mono font-bold">
                    {couponCode}
                  </Badge>
                </div>
              ) : null}

              {fallbackBreakdown.planOriginal != null &&
              fallbackBreakdown.planAfterCoupon != null &&
              fallbackBreakdown.planAfterCoupon < fallbackBreakdown.planOriginal ? (
                <div className="flex items-center justify-between text-sm text-green-600">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Discount applied
                  </span>
                  <span className="font-semibold">
                    -{" "}
                    {formatFallbackEur(
                      fallbackBreakdown.planOriginal -
                        fallbackBreakdown.planAfterCoupon,
                    )}
                  </span>
                </div>
              ) : null}

              <Separator className="bg-lime-100" />

              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">
                  Total
                </span>
                <span className="text-2xl font-extrabold text-lime-700">
                  {totalLabel}
                </span>
              </div>
            </CardContent>
          </Card>

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
  );
}

export default function PaymentPage() {
  const router = useRouter();
  const { planId, addonIds, couponCode, invoiceDetails } = useCheckoutStore();
  const hasItems = !!planId || addonIds.length > 0;
  const invoiceErrors = getInvoiceValidationErrors(invoiceDetails);

  useEffect(() => {
    if (!hasItems || invoiceErrors.length > 0) {
      router.replace("/checkout");
    }
  }, [hasItems, invoiceErrors.length, router]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "create-intent",
      planId ?? "add-ons-only",
      addonIds,
      couponCode,
      invoiceDetails,
    ],
    queryFn: async () => {
      const result = await CreateSubWithAddOn(
        planId,
        couponCode,
        addonIds,
        invoiceDetails,
        window.location.origin,
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result;
    },
    enabled: hasItems && invoiceErrors.length === 0,
    staleTime: 0,
    retry: false,
  });

  const clientSecret = data?.data?.key;
  const finalAmount = data?.data?.finalAmount ?? 0;
  const breakdown = {
    planOriginal: data?.data?.breakdown?.planOriginal ?? null,
    planAfterCoupon: data?.data?.breakdown?.planAfterCoupon ?? null,
    addOnsApplied: (data?.data?.breakdown?.addOnsApplied ?? []) as Array<{
      id: string;
      type: string;
      priceCents: number;
    }>,
  };

  if (isLoading || !hasItems) {
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
        <CheckoutProvider
          stripe={stripePromise}
          options={{
            fetchClientSecret: async () => clientSecret,
            adaptivePricing: {
              allowed: true,
            },
            elementsOptions: {
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#84cc16",
                  colorBackground: "#ffffff",
                  borderRadius: "12px",
                  fontFamily: "inherit",
                },
              },
            },
          } as any}
        >
          <CheckoutPane
            fallbackTotalCents={finalAmount}
            fallbackBreakdown={breakdown}
            couponCode={couponCode}
          />
        </CheckoutProvider>
      </div>
    </div>
  );
}
