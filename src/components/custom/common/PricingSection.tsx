"use client";
import { useState } from "react";
import {
  getFeatureDescription,
  getLimitDescription,
} from "@/@types/feature-mapping";
import { PricingPlan } from "@/@types/pricing";
import { getAllThePlans } from "@/actions/fetch-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Crown,
  ArrowRight,
  Diamond,
  Rocket,
  Sparkles,
  X,
  Users,
  Calendar,
  Share2,
  Settings,
  Shield,
} from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getAllThePlans(),
  });

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(priceCents / 100);
  };

  const getPlanConfig = (index: number) => {
    const configs = [
      {
        gradient: "from-lime-50 to-green-50",
        border: "border-lime-200/60",
        button: "from-lime-500 via-lime-600 to-green-600",
        icon: Rocket,
        iconColor: "text-lime-600",
        buttonText: "Start Building",
        buttonIcon: Rocket,
        tier: "STARTER",
      },
      {
        gradient: "from-green-50 to-emerald-50",
        border: "border-green-200/60",
        button: "from-green-500 via-green-600 to-emerald-600",
        icon: Crown,
        iconColor: "text-green-600",
        buttonText: "Claim Your Plan",
        buttonIcon: Crown,
        tier: "PROFESSIONAL",
      },
      {
        gradient: "from-lime-50 to-lime-50",
        border: "border-lime-200/60",
        button: "from-lime-600 via-lime-600 to-green-500",
        icon: Diamond,
        iconColor: "text-lime-600",
        buttonText: "Go Premium",
        buttonIcon: Diamond,
        tier: "ENTERPRISE",
      },
    ];
    return configs[index % configs.length];
  };

  const getFeatureIcon = (feature: string) => {
    if (
      feature.toLowerCase().includes("user") ||
      feature.toLowerCase().includes("guest")
    )
      return Users;
    if (
      feature.toLowerCase().includes("event") ||
      feature.toLowerCase().includes("calendar")
    )
      return Calendar;
    if (
      feature.toLowerCase().includes("share") ||
      feature.toLowerCase().includes("qr")
    )
      return Share2;
    if (
      feature.toLowerCase().includes("manage") ||
      feature.toLowerCase().includes("dashboard")
    )
      return Settings;
    if (
      feature.toLowerCase().includes("secure") ||
      feature.toLowerCase().includes("auth")
    )
      return Shield;
    return Check;
  };

  return (
    <>
      {/* Sticky Upgrade Banner */}
      <div className="flex justify-between items-center w-full p-4 bg-gradient-to-r from-lime-500 via-green-600 to-emerald-600 border-b border-green-700 shadow-lg">
        <div className="flex items-center mx-auto gap-3">
          <Sparkles className="h-5 w-5 text-white" />
          <p className="flex items-center text-sm font-semibold text-white">
            <span>
              Upgrade your plan today and unlock premium features!{" "}
              <button
                onClick={() => setIsOpen(true)}
                className="inline font-bold text-yellow-200 underline underline-offset-2 decoration-2 hover:text-yellow-100 hover:no-underline"
              >
                View Plans
              </button>
            </span>
          </p>
          <Crown className="h-5 w-5 text-yellow-200" />
        </div>
      </div>

      {/* Drawer/Sheet Component */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="top"
          className="h-screen overflow-y-auto bg-gradient-to-b from-white to-lime-50 border-none p-0"
        >
          {/* Fully Scrollable Container for Any Number of Cards */}
          <div className="w-full min-h-screen py-12 px-6">
            <div className="container mx-auto max-w-7xl">
              {/* Auto-responsive Grid - Handles unlimited cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
                {data?.data?.map((plan, index) => {
                  const config = getPlanConfig(index);
                  const isPopular = index === 1;
                  const IconComponent = config.icon;
                  const ButtonIcon = config.buttonIcon;

                  return (
                    <div key={plan._id} className="w-full">
                      <Card
                        className={`relative h-full bg-gradient-to-br ${
                          config.gradient
                        } border ${
                          config.border
                        } rounded-xl hover:shadow-lg transition-shadow duration-300 ${
                          isPopular ? "ring-2 ring-green-400" : ""
                        }`}
                      >
                        {/* Popular Badge */}
                        {isPopular && (
                          <div className="absolute -top-2 right-4 z-10">
                            <div className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-md">
                              <Crown className="h-3 w-3" />
                              Most Popular
                            </div>
                          </div>
                        )}

                        {/* Compact Header */}
                        <CardHeader className="text-center pb-3 pt-6 px-4 space-y-2">
                          <div className="flex items-center justify-center mb-2">
                            <div className="relative w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
                              <IconComponent
                                className={`h-6 w-6 ${config.iconColor}`}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              {config.tier}
                            </div>
                            <CardTitle className="text-lg font-bold text-slate-900">
                              {plan.title}
                            </CardTitle>
                          </div>

                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-3xl font-bold text-slate-900">
                              {formatPrice(plan.priceCents, plan.currency)}
                            </span>
                            <span className="text-slate-500 text-xs font-medium">
                              /year
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 px-2 line-clamp-2">
                            {plan.description}
                          </p>
                        </CardHeader>

                        {/* Compact Content */}
                        <CardContent className="px-4 pb-4 space-y-3">
                          {/* Shortened Features - Show only first 3 */}
                          <div>
                            <h4 className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11px] mb-2 uppercase tracking-wide">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              What's Included
                            </h4>
                            <ul className="space-y-1.5">
                              {plan.permissions
                                .slice(0, 3)
                                .map((feature, featureIndex) => {
                                  const FeatureIcon = getFeatureIcon(
                                    getFeatureDescription(feature),
                                  );
                                  return (
                                    <li
                                      key={featureIndex}
                                      className="flex items-start gap-2 text-xs"
                                    >
                                      <div className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <FeatureIcon className="h-3 w-3 text-green-600" />
                                      </div>
                                      <span className="text-slate-700 leading-snug">
                                        {getFeatureDescription(feature)}
                                      </span>
                                    </li>
                                  );
                                })}
                              {plan.permissions.length > 3 && (
                                <li className="text-xs text-slate-500 pl-7">
                                  +{plan.permissions.length - 3} more features
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Shortened Limits - Show only first 2 */}
                          {plan.limits.length > 0 && (
                            <div>
                              <h4 className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11px] mb-2 uppercase tracking-wide">
                                <div className="w-1.5 h-1.5 bg-lime-500 rounded-full"></div>
                                Usage Limits
                              </h4>
                              <ul className="space-y-1.5">
                                {plan?.limits
                                  ?.slice(0, 2)
                                  .map((limit, limitIndex) => (
                                    <li
                                      key={limitIndex}
                                      className="flex items-start gap-2 text-xs"
                                    >
                                      <div className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <Check className="h-3 w-3 text-green-600" />
                                      </div>
                                      <span className="text-slate-700 leading-snug">
                                        {limit.limit.toLocaleString()}{" "}
                                        {getLimitDescription(limit.key)}
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}

                          {/* Compact CTA Button */}
                          <Link
                            href={`/payment?plan=${plan._id}&price=${plan.priceCents}`}
                          >
                            <Button
                              className={`group relative w-full bg-gradient-to-r ${config.button} text-white font-bold text-sm py-4 px-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-0`}
                              size="sm"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                <ButtonIcon className="h-4 w-4" />
                                {config.buttonText}
                                <ArrowRight className="h-4 w-4" />
                              </span>
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
