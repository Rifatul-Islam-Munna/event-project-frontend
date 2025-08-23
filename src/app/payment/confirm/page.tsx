// app/billing/return/page.tsx
"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSubTokenFirst } from "@/actions/fetch-action";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
const API = process.env.NEXT_PUBLIC_API_URL!;
const userId = "u1"; // from your auth/session

export default function ReturnPage() {
  const params = useSearchParams();
  const router = useRouter();

  const plan = params.get("plan") ?? "basic";
  const clientSecret = params.get("payment_intent_client_secret") ?? "";
  console.log("clientSecret->", clientSecret);
  const q = useQuery({
    queryKey: ["finalize-payment", clientSecret, plan, userId],
    enabled: !!clientSecret, // don’t run without required param
    queryFn: async () => {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe init failed");
      const { paymentIntent, error } = await stripe.retrievePaymentIntent(
        clientSecret
      );
      if (error) throw new Error(error.message || "Payment retrieval error");
      if (!paymentIntent) throw new Error("No PaymentIntent found");

      if (paymentIntent.status === "succeeded") {
        await getSubTokenFirst(paymentIntent.id);
        return { status: "succeeded" as const };
      }
      return { status: paymentIntent.status as string };
    },
  });

  if (!clientSecret) return <div>Missing client secret.</div>;
  if (q.isLoading) return <div>Finalizing…</div>;
  if (q.isError)
    return <div>{(q.error as Error).message || "Finalize error"}</div>;

  // Only reached if not succeeded (e.g., processing, requires_payment_method, etc.)
  return <div>Payment status: {q.data?.status}</div>;
}
