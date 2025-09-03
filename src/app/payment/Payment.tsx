"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { subScript } from "@/actions/fetch-action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Shield, CheckCircle } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  {
    developerTools: { assistant: { enabled: true } },
  }
);

function Checkout({
  clientSecret,
  plan,
  price,
}: {
  clientSecret: string;
  plan: string;
  price: number;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const confirmPay = useMutation({
    mutationKey: ["confirm-pay"],
    mutationFn: async () => {
      if (!stripe || !elements) throw new Error("Stripe not ready");

      const { error: submitError } = await elements.submit();
      if (submitError)
        throw new Error(submitError.message || "Form submit failed");

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${
            window.location.origin
          }/payment/confirm?plan=${encodeURIComponent(plan)}`,
        },
        redirect: "always",
      });
      if (error) throw new Error(error.message || "Payment failed");
    },
    onError: (e: any) => alert(e.message || "Payment error"),
  });

  const getPlanDetails = (planName: string) => {
    const plans = {
      basic: {
        name: "Basic Plan",
        price: "$9.99",
        features: ["Feature 1", "Feature 2", "Feature 3"],
      },
      pro: {
        name: "Pro Plan",
        price: "$19.99",
        features: [
          "All Basic features",
          "Feature 4",
          "Feature 5",
          "Priority support",
        ],
      },
      enterprise: {
        name: "Enterprise Plan",
        price: "$49.99",
        features: [
          "All Pro features",
          "Custom integrations",
          "Dedicated support",
        ],
      },
    };
    return plans[planName as keyof typeof plans] || plans.basic;
  };

  const planDetails = getPlanDetails(plan);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Plan Summary Card */}

      {/* Payment Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Your payment information is secure and encrypted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirmPay.mutate();
            }}
            className="space-y-6"
          >
            <div className="p-4 border rounded-lg bg-background">
              <PaymentElement
                options={{
                  layout: "tabs",
                }}
              />
            </div>

            <Button
              type="submit"
              disabled={!stripe || confirmPay.isPending}
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
                  Complete Payment • ${price}
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
      {/* 
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl">Complete Your Purchase</CardTitle>
          </div>
          <CardDescription>
            You're subscribing to the {planDetails.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold text-lg">{planDetails.name}</h3>
              <Badge variant="secondary" className="mt-1">
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {price ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}

export default function BillingPage() {
  const params = useSearchParams();
  const plan = params.get("plan") ?? "basic";
  const total = (params.get("price") as number | null) ?? 0;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["create-intent", plan],
    queryFn: () => subScript(plan),
    enabled: !params.get("payment_intent_client_secret"),
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
            <p className="text-sm text-muted-foreground text-center">
              {(error as Error).message || "Failed to initialize payment"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clientSecret = data?.data?.key;
  const customerSessionSecret = data?.data?.customerSessionSecret;
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
        </div>

        <Elements
          stripe={stripePromise!}
          options={{
            clientSecret,
            customerSessionClientSecret: customerSessionSecret,
          }}
        >
          <Checkout
            clientSecret={clientSecret}
            plan={plan}
            price={total / 100}
          />
        </Elements>
      </div>
    </div>
  );
}
