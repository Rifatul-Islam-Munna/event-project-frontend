"use client";

import { useState } from "react";
import {
  useStripe,
  useElements,
  AddressElement,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { prepareBilling } from "@/actions/fetch-action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function BillingForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    if (!stripe || !elements) return;
    setSaving(true);
    setMsg(null);

    const { error } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });
    console.log("error->", error);

    setSaving(false);
    setMsg(error ? error.message ?? "Something went wrong" : "Saved 🎉");
    toast.success(error ? error.message ?? "Something went wrong" : "Saved 🎉");
    if (!error) {
      router.push("/");
    }
  };

  return (
    <div className="rounded-lg bg-white p-8 shadow py-20">
      {/* Address */}
      <h2 className="mb-4 text-lg font-semibold text-gray-700">
        Billing address
      </h2>
      <AddressElement
        options={{ mode: "billing" }}
        onChange={(e) => setReady(e.complete)}
      />

      {/* Card */}
      <h2 className="mt-8 mb-4 text-lg font-semibold text-gray-700">
        Card details
      </h2>
      <PaymentElement />

      {/* Action */}
      <button
        onClick={handleSave}
        disabled={!ready || saving || !stripe}
        className="mt-8 w-full rounded-md bg-indigo-600 py-3 font-medium text-white
                   transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save billing info"}
      </button>

      {msg && (
        <p className="mt-4 text-center text-sm text-emerald-600">{msg}</p>
      )}
    </div>
  );
}
export default BillingForm;
