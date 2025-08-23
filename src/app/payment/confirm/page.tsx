"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSubTokenFirst } from "@/actions/fetch-action";
import { CheckCircle, XCircle, Clock, AlertCircle, Home } from "lucide-react";

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

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "succeeded":
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          title: "Payment Successful!",
          message: "Your subscription has been activated successfully.",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
          buttonColor: "bg-green-600 hover:bg-green-700",
        };
      case "processing":
        return {
          icon: <Clock className="w-16 h-16 text-blue-500" />,
          title: "Payment Processing",
          message: "Your payment is being processed. Please wait a moment.",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
        };
      case "requires_payment_method":
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: "Payment Failed",
          message: "Your payment method was declined. Please try again.",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          buttonColor: "bg-red-600 hover:bg-red-700",
        };
      default:
        return {
          icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
          title: "Payment Status Unknown",
          message: `Payment status: ${status}`,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
          buttonColor: "bg-yellow-600 hover:bg-yellow-700",
        };
    }
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-200">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Missing Information
          </h1>
          <p className="text-gray-600 mb-6">Payment information is missing.</p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (q.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Finalizing Payment
          </h1>
          <p className="text-gray-600">
            Please wait while we process your payment...
          </p>
        </div>
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-200">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Error
          </h1>
          <p className="text-gray-600 mb-6">
            {(q.error as Error).message || "Finalize error"}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/billing")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(q.data?.status || "unknown");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border ${statusDisplay.borderColor}`}
      >
        <div
          className={`${statusDisplay.bgColor} rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6`}
        >
          {statusDisplay.icon}
        </div>

        <h1 className={`text-2xl font-bold mb-2 ${statusDisplay.textColor}`}>
          {statusDisplay.title}
        </h1>

        <p className="text-gray-600 mb-2">{statusDisplay.message}</p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Plan Selected</p>
          <p className="font-semibold text-gray-900 capitalize">{plan}</p>
        </div>

        <div className="space-y-3">
          {q.data?.status === "succeeded" && (
            <button
              onClick={() => router.push("/dashboard")}
              className={`w-full ${statusDisplay.buttonColor} text-white font-semibold py-3 px-6 rounded-xl transition-colors`}
            >
              Go to Dashboard
            </button>
          )}

          {q.data?.status === "requires_payment_method" && (
            <button
              onClick={() => router.push(`/billing?plan=${plan}`)}
              className={`w-full ${statusDisplay.buttonColor} text-white font-semibold py-3 px-6 rounded-xl transition-colors`}
            >
              Try Different Payment Method
            </button>
          )}

          <button
            onClick={() => router.push("/")}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
