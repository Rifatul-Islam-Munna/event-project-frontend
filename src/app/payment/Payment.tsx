"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  CheckoutProvider,
  CurrencySelectorElement,
  PaymentElement,
  useCheckout,
} from "@stripe/react-stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AddSubForAddOn, subScript } from "@/actions/fetch-action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CreditCard,
  Shield,
  Globe2,
} from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  {
    developerTools: { assistant: { enabled: true } },
  },
);

function CheckoutCard({
  plan,
  type,
}: {
  plan: string;
  type?: string | null;
}) {
  const checkout = useCheckout();
  const router = useRouter();
  const hasCurrencyOptions = (checkout.currencyOptions?.length ?? 0) > 0;

  const confirmPay = useMutation({
    mutationKey: ["confirm-pay-legacy-route", type],
    mutationFn: async () => {
      const result = await checkout.confirm({
        returnUrl: `${window.location.origin}/payment/confirm${type === "add-on" ? "?type=add-on&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
        redirect: "if_required",
      });

      if (result.type === "error") {
        throw new Error(result.error.message ?? "Payment failed");
      }

      const query = new URLSearchParams({
        session_id: result.session.id,
        ...(plan ? { plan } : {}),
        ...(type === "add-on" ? { type: "add-on" } : {}),
      });
      router.push(`/payment/confirm?${query.toString()}`);
    },
    onError: (e: Error) => alert(e.message || "Payment error"),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-lime-500" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Pay in your local currency or switch back to EUR before confirming.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasCurrencyOptions ? (
            <div className="mb-5 rounded-xl border border-lime-200 bg-lime-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Globe2 className="h-4 w-4 text-lime-600" />
                Currency options
              </div>
              <CurrencySelectorElement />
            </div>
          ) : null}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirmPay.mutate();
            }}
            className="space-y-6"
          >
            <div className="p-4 border rounded-lg bg-background">
              <PaymentElement options={{ layout: "tabs" }} />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-lime-200 bg-lime-50 px-4 py-3">
              <span className="text-sm font-semibold text-slate-700">
                Amount due
              </span>
              <span className="text-xl font-bold text-lime-700">
                {checkout.total?.total?.amount ?? "Loading..."}
              </span>
            </div>

            <Button
              type="submit"
              disabled={confirmPay.isPending}
              className="w-full h-12 text-lg font-semibold"
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
                  Complete Payment
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Secured by Stripe • SSL Encrypted
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  const params = useSearchParams();
  const plan = params.get("plan") ?? "basic";
  const coupon = params.get("coupon");
  const type = params.get("type") ?? null;
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["create-intent", plan, type, coupon],
    queryFn: () =>
      type === "add-on"
        ? AddSubForAddOn(plan, undefined, window.location.origin)
        : subScript(plan, coupon, undefined, window.location.origin),
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Setting up your payment
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we prepare your secure checkout...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-destructive">
              Payment Setup Failed
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {(error as Error).message || "Failed to initialize payment"}
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clientSecret = data?.data?.key;

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-destructive">
              Setup Error
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Failed to start payment process. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Secure Checkout
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete your subscription in just a few clicks
          </p>
          <Badge className="mt-4 bg-lime-100 text-lime-700 border-lime-200">
            Local currency available
          </Badge>
        </div>

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
                  borderRadius: "12px",
                  fontFamily: "inherit",
                },
              },
            },
          } as any}
        >
          <CheckoutCard plan={plan} type={type} />
        </CheckoutProvider>
      </div>
    </div>
  );
}
