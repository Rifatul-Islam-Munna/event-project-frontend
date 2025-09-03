//     app/billing/BillingShell.tsx   ← CLIENT COMPONENT
"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import BillingForm from "./BillingFrom";
// form with AddressElement …

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function BillingShell({
  clientSecret,
}: {
  clientSecret: string;
}) {
  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme: "stripe" } }}
    >
      <BillingForm />
    </Elements>
  );
}
