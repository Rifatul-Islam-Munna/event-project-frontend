// app/billing/page.tsx
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

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  { developerTools: { assistant: { enabled: true } } }
);

function Checkout({
  clientSecret,
  plan,
}: {
  clientSecret: string;
  plan: string;
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        confirmPay.mutate();
      }}
    >
      <PaymentElement />
      <button type="submit" disabled={!stripe || confirmPay.isPending}>
        {confirmPay.isPending ? "Processing" : "Pay"}
      </button>
    </form>
  );
}

export default function BillingPage() {
  const params = useSearchParams();
  const plan = params.get("plan") ?? "basic";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["create-intent", plan],
    queryFn: () => subScript(plan),
    enabled: !params.get("payment_intent_client_secret"),
    staleTime: 0,
  });

  if (isLoading) return <div>Loading…</div>;
  if (isError) return <div>{(error as Error).message || "Init error"}</div>;

  const clientSecret = data?.data?.key;
  if (!clientSecret) return <div>Failed to start payment.</div>;

  return (
    <Elements stripe={stripePromise!} options={{ clientSecret }}>
      <Checkout clientSecret={clientSecret} plan={plan} />
    </Elements>
  );
}
