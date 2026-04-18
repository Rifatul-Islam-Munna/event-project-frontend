"use client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Mail,
  Phone,
  CreditCard,
  Package,
  Lock,
  ShoppingCart,
  Euro,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getForUser } from "@/actions/vendor-category-actions";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────
enum AddOnType {
  message = "message",
  whatsapp = "whatsapp",
  email = "email",
  flushCard = "flushCard",
}

interface AddOn {
  _id: string;
  type: AddOnType;
  numberMessage: number;
  message: string;
  flushCardCoupon: string;
  price: number;
}

// ─── Type Config ─────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  [AddOnType.message]: { label: "SMS", icon: MessageSquare },
  [AddOnType.whatsapp]: { label: "WhatsApp", icon: Phone },
  [AddOnType.email]: { label: "Email", icon: Mail },
  [AddOnType.flushCard]: { label: "Flush Card", icon: CreditCard },
} as const;

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white overflow-hidden animate-pulse flex flex-col">
      <div className="h-[2px] w-full bg-zinc-100" />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-3.5 rounded bg-zinc-100" />
          <div className="h-3.5 w-14 rounded bg-zinc-100" />
        </div>
        <div className="h-4 w-24 bg-zinc-100 rounded" />
        <div className="h-px bg-zinc-100 w-full" />
        <div className="flex items-center justify-between">
          <div className="h-3 w-8 bg-zinc-100 rounded" />
          <div className="h-4 w-12 bg-zinc-100 rounded" />
        </div>
        <div className="h-8 w-full bg-zinc-100 rounded-lg mt-auto" />
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function AddOnCard({ addOn, onBuy }: { addOn: AddOn; onBuy: () => void }) {
  const config = TYPE_CONFIG[addOn.type] ?? { label: "Add-On", icon: Package };
  const Icon = config.icon;
  const isFlushCard = addOn.type === AddOnType.flushCard;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden flex flex-col">
      {/* Lime top line */}
      <div className="h-[2px] w-full bg-lime-500 shrink-0" />

      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-700">
            {config.label} Add-On
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-medium px-1.5 py-px border-zinc-200 text-zinc-400 bg-transparent rounded"
        >
          {config.label}
        </Badge>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-zinc-100" />

      {/* Body — grows to push footer down */}
      <div className="px-4 py-3 flex flex-col gap-2.5 flex-1">
        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">Price</span>
          <span className="flex items-center gap-0.5 text-sm font-bold text-zinc-900 tabular-nums">
            <Euro className="h-3 w-3 text-zinc-500" />
            {addOn.price != null ? addOn.price.toFixed(2) : "0.00"}
          </span>
        </div>

        {/* Messages count (non-flushcard) */}
        {!isFlushCard && addOn.numberMessage > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-50 border border-zinc-100">
            <Zap className="h-3 w-3 text-lime-500 shrink-0" />
            <span className="text-xs text-zinc-600 font-medium">
              {addOn.numberMessage.toLocaleString()} messages
            </span>
          </div>
        )}

        {/* Description */}
        {addOn.message && (
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
            {addOn.message}
          </p>
        )}

        {/* Flush Card extras */}
        {isFlushCard && (
          <div className="space-y-2">
            {!addOn.message && (
              <p className="text-xs text-zinc-400 leading-relaxed">
                Purchase to unlock your exclusive coupon code.
              </p>
            )}

            {/* Blurred coupon */}
            <div className="relative flex items-center gap-2 px-2.5 py-1.5 bg-zinc-50 border border-zinc-100 rounded-md overflow-hidden">
              <Lock className="h-3 w-3 text-zinc-400 shrink-0 z-10 relative" />
              <span
                className="font-mono text-[11px] font-semibold tracking-wider text-zinc-600 select-none blur-sm z-10 relative"
                aria-hidden="true"
              >
                {addOn.flushCardCoupon || "XXXXXXXXXXXX"}
              </span>
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]" />
            </div>

            <p className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" />
              Revealed after purchase
            </p>

            {/* Flashback link */}
            <a
              href="https://flashback.camera/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md border border-zinc-100 bg-zinc-50 hover:bg-zinc-100 transition-colors"
            >
              <span className="text-[11px] font-medium text-zinc-500">
                Visit Flashback Camera
              </span>
              <ArrowUpRight className="h-3 w-3 text-zinc-400" />
            </a>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-zinc-100" />

      {/* Footer — always at bottom */}
      <div className="px-4 py-3">
        <Button
          onClick={onBuy}
          size="sm"
          className="w-full h-8 text-xs font-semibold bg-lime-600 hover:bg-lime-700 text-white gap-1.5 rounded-lg"
        >
          <ShoppingCart className="h-3 w-3" />
          Buy Now
        </Button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AddOnCards({
  onBuyNow,
}: {
  onBuyNow?: (addOn: AddOn) => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["add-ons"],
    queryFn: () => getForUser(),
    staleTime: 5 * 60 * 1000,
  });
  const router = useRouter();
  const addOns: AddOn[] = data?.data ?? [];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
        <Package className="h-7 w-7 text-zinc-300" />
        <p className="text-sm font-medium text-zinc-500">
          Failed to load add-ons
        </p>
        <p className="text-xs text-zinc-400">Please try again later</p>
      </div>
    );
  }

  if (!isLoading && addOns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
        <Package className="h-7 w-7 text-zinc-300" />
        <p className="text-sm font-medium text-zinc-500">
          No add-ons available
        </p>
        <p className="text-xs text-zinc-400">Check back soon</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        : addOns.map((addOn) => (
            <AddOnCard
              key={addOn._id}
              addOn={addOn}
              onBuy={() =>
                onBuyNow
                  ? onBuyNow(addOn)
                  : router.push(`/payment?plan=${addOn._id}&type=add-on`)
              }
            />
          ))}
    </div>
  );
}
