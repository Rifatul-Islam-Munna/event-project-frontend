"use client";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSubTokenFirst } from "@/actions/fetch-action";
import { useCheckoutStore } from "@/zustan-fn/checkout-store";
import { useEffect } from "react";
import { m, LazyMotion, domAnimation } from "motion/react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Home,
  LayoutDashboard,
  CreditCard,
  Loader2,
  Shield,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  succeeded: {
    icon: CheckCircle,
    iconColor: "text-lime-500",
    iconBg: "bg-lime-100",
    title: "Payment Successful!",
    message: "Your purchase has been completed successfully.",
    cardBorder: "border-lime-200",
    cardBg: "bg-lime-50/30",
    badge: "bg-lime-100 text-lime-700",
  },
  processing: {
    icon: Clock,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-100",
    title: "Payment Processing",
    message:
      "Your payment is being processed. This usually takes a few moments.",
    cardBorder: "border-blue-200",
    cardBg: "bg-blue-50/30",
    badge: "bg-blue-100 text-blue-700",
  },
  requires_payment_method: {
    icon: XCircle,
    iconColor: "text-red-500",
    iconBg: "bg-red-100",
    title: "Payment Failed",
    message: "Your payment method was declined. Please try a different card.",
    cardBorder: "border-red-200",
    cardBg: "bg-red-50/30",
    badge: "bg-red-100 text-red-700",
  },
  unknown: {
    icon: AlertCircle,
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-100",
    title: "Status Unknown",
    message:
      "We couldn't determine your payment status. Please contact support.",
    cardBorder: "border-yellow-200",
    cardBg: "bg-yellow-50/30",
    badge: "bg-yellow-100 text-yellow-700",
  },
} as const;

export default function ConfirmPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { clearCheckout } = useCheckoutStore();

  // ✅ Stripe appends this automatically to return_url
  const clientSecret = params.get("payment_intent_client_secret") ?? "";

  const q = useQuery({
    queryKey: ["finalize-payment", clientSecret],
    enabled: !!clientSecret,
    queryFn: async () => {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe init failed");

      const { paymentIntent, error } =
        await stripe.retrievePaymentIntent(clientSecret);
      if (error) throw new Error(error.message ?? "Payment retrieval error");
      if (!paymentIntent) throw new Error("No PaymentIntent found");

      if (paymentIntent.status === "succeeded") {
        // ✅ Single unified endpoint — no more type distinction
        await getSubTokenFirst(paymentIntent.id);
        return { status: "succeeded" as const };
      }

      return { status: paymentIntent.status as string };
    },
  });

  // ✅ Clear store once payment is confirmed succeeded
  useEffect(() => {
    if (q.data?.status === "succeeded") {
      clearCheckout();
    }
  }, [q.data?.status, clearCheckout]);

  // ── Missing client secret ─────────────────────────────────────────────────
  if (!clientSecret) {
    return (
      <FullScreenCard
        icon={XCircle}
        iconColor="text-red-500"
        iconBg="bg-red-100"
        cardBorder="border-red-200"
        title="Missing Payment Info"
        message="Payment confirmation data is missing. Please contact support."
      >
        <Button
          onClick={() => router.push("/")}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold h-11 rounded-xl"
        >
          <Home className="h-4 w-4 mr-2" />
          Go Home
        </Button>
      </FullScreenCard>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (q.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-lime-50/30 flex items-center justify-center p-4">
        <LazyMotion features={domAnimation}>
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-lime-200 p-10 max-w-md w-full text-center"
          >
            <div className="relative mx-auto mb-6 h-20 w-20">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-lime-100" />
              {/* Spinning ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-lime-500 animate-spin" />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-lime-500" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Finalizing Payment
            </h1>
            <p className="text-sm text-slate-500">
              Please wait while we activate your subscription...
            </p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Shield className="h-3 w-3" />
              Secured by Stripe
            </div>
          </m.div>
        </LazyMotion>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (q.isError) {
    return (
      <FullScreenCard
        icon={XCircle}
        iconColor="text-red-500"
        iconBg="bg-red-100"
        cardBorder="border-red-200"
        title="Payment Error"
        message={(q.error as Error)?.message ?? "Something went wrong"}
      >
        <Button
          onClick={() => router.push("/checkout")}
          className="w-full bg-gradient-to-r from-lime-500 to-lime-600 text-white font-semibold h-11 rounded-xl"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="w-full h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Home className="h-4 w-4 mr-2" />
          Go Home
        </Button>
      </FullScreenCard>
    );
  }

  // ── Status result ─────────────────────────────────────────────────────────
  const status = (q.data?.status ?? "unknown") as keyof typeof STATUS_CONFIG;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown;
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-lime-50/30 flex items-center justify-center p-4">
      <LazyMotion features={domAnimation}>
        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "bg-white rounded-2xl shadow-xl border p-8 max-w-md w-full text-center",
            cfg.cardBorder,
          )}
        >
          {/* Icon */}
          <m.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className={cn(
              "h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6",
              cfg.iconBg,
            )}
          >
            <Icon className={cn("h-12 w-12", cfg.iconColor)} />
          </m.div>

          {/* Title */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {cfg.title}
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              {cfg.message}
            </p>
          </m.div>

          {/* Status badge */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide",
                cfg.badge,
              )}
            >
              {status === "succeeded" && <Sparkles className="h-3 w-3" />}
              {status.replace(/_/g, " ")}
            </span>
          </m.div>

          {/* Actions */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-3"
          >
            {status === "succeeded" && (
              <Button
                onClick={() => router.push("/dashboard")}
                className={cn(
                  "w-full h-11 font-semibold rounded-xl text-white",
                  "bg-gradient-to-r from-lime-500 to-lime-600",
                  "hover:from-lime-600 hover:to-lime-700",
                  "shadow-md shadow-lime-200 transition-all",
                )}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            )}

            {status === "requires_payment_method" && (
              <Button
                onClick={() => router.push("/checkout")}
                className="w-full h-11 font-semibold rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Try Different Card
              </Button>
            )}

            {status === "processing" && (
              <Button
                onClick={() => router.refresh()}
                variant="outline"
                className="w-full h-11 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
            )}

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </m.div>

          {/* Footer */}
          <p className="mt-5 text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Shield className="h-3 w-3" />
            256-bit SSL encrypted · Secured by Stripe
          </p>
        </m.div>
      </LazyMotion>
    </div>
  );
}

// ─── Reusable full-screen card ────────────────────────────────────────────────
function FullScreenCard({
  icon: Icon,
  iconColor,
  iconBg,
  cardBorder,
  title,
  message,
  children,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  cardBorder: string;
  title: string;
  message: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-lime-50/30 flex items-center justify-center p-4">
      <LazyMotion features={domAnimation}>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "bg-white rounded-2xl shadow-xl border p-8 max-w-md w-full text-center space-y-4",
            cardBorder,
          )}
        >
          <div
            className={cn(
              "h-20 w-20 rounded-full flex items-center justify-center mx-auto",
              iconBg,
            )}
          >
            <Icon className={cn("h-10 w-10", iconColor)} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{message}</p>
          <div className="space-y-3 pt-2">{children}</div>
        </m.div>
      </LazyMotion>
    </div>
  );
}
