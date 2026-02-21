"use client";
import { LazyMotion, domAnimation, m } from "motion/react";
import {
  getFeatureDescription,
  getLimitDescription,
} from "@/@types/feature-mapping";
import { PricingPlan } from "@/@types/pricing";
import { getAllThePlans } from "@/actions/fetch-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Crown,
  Star,
  ArrowRight,
  Diamond,
  Rocket,
  Sparkles,
  Users,
  Calendar,
  Share2,
  Settings,
  Shield,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function PricingSection() {
  const [planType, setPlanType] = useState<string>("Event package");
  const [couponCode, setCouponCode] = useState("");

  const { data } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getAllThePlans(),
  });

  const formatPrice = (priceCents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(priceCents / 100);
  };

  const getPlanConfig = (index: number) => {
    const configs = [
      {
        gradient: "from-lime-50 to-lime-50",
        border: "border-lime-200/60",
        button: "from-lime-500 via-lime-600 to-lime-600",
        buttonShadow: "shadow-[0_8px_32px_rgba(132,204,22,0.4)]",
        buttonHoverShadow: "hover:shadow-[0_12px_40px_rgba(132,204,22,0.6)]",
        icon: Rocket,
        iconColor: "text-lime-600",
        accent: "lime",
        buttonText: "Start Building",
        buttonIcon: Rocket,
        tier: "Starter",
      },
      {
        gradient: "from-lime-50 to-lime-50",
        border: "border-lime-200/60",
        button: "from-lime-500 via-lime-600 to-lime-600",
        buttonShadow: "shadow-[0_8px_32px_rgba(34,197,94,0.4)]",
        buttonHoverShadow: "hover:shadow-[0_12px_40px_rgba(34,197,94,0.6)]",
        icon: Crown,
        iconColor: "text-lime-600",
        accent: "lime",
        buttonText: "Claim Your Plan",
        buttonIcon: Crown,
        tier: "Professional",
      },
      {
        gradient: "from-lime-50 to-lime-50",
        border: "border-lime-200/60",
        button: "from-lime-600 via-lime-600 to-lime-500",
        buttonShadow: "shadow-[0_8px_32px_rgba(163,230,53,0.4)]",
        buttonHoverShadow: "hover:shadow-[0_12px_40px_rgba(163,230,53,0.6)]",
        icon: Diamond,
        iconColor: "text-lime-600",
        accent: "lime",
        buttonText: "Go Premium",
        buttonIcon: Diamond,
        tier: "Enterprise",
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  // ✅ Sorted by order ascending
  const plannerPackages = data?.data
    ?.filter((plan) => plan.type === "Planer package")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const eventPackages = data?.data
    ?.filter((plan) => plan.type === "Event package")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const renderPricingCards = (plans: PricingPlan[]) => (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="grid w-full mx-auto gap-10 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {plans?.map((plan, index) => {
        const config = getPlanConfig(index);
        const isPopular = plan.isPopular; // ✅ from DB, not hardcoded index
        const IconComponent = config.icon;
        const ButtonIcon = config.buttonIcon;

        return (
          <m.div
            key={plan._id}
            variants={cardVariants}
            whileHover={{
              y: -4,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            className="group relative h-full"
          >
            <Card
              className={`relative h-full bg-gradient-to-br ${config.gradient} border ${
                config.border
              } rounded-2xl transition-all duration-300 hover:shadow-lg ${
                isPopular ? "ring-2 ring-lime-300 scale-105" : ""
              }`}
            >
              {/* ✅ Popular badge driven by plan.isPopular */}
              {isPopular && (
                <m.div
                  variants={pulseVariants}
                  animate="animate"
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10"
                >
                  <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-lime-600 to-lime-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    <Crown className="h-4 w-4" />
                    Most Popular
                  </div>
                </m.div>
              )}

              <CardHeader className="text-center pb-4 pt-8 px-6 space-y-4">
                <div className="flex items-center justify-center mb-3">
                  <m.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300"
                  >
                    <IconComponent className={`h-8 w-8 ${config.iconColor}`} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent rounded-2xl" />
                  </m.div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {config.tier}
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {plan.title}
                  </CardTitle>
                </div>

                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-slate-900">
                    {formatPrice(plan.priceCents)}
                  </span>
                </div>

                <p className="text-sm text-slate-600 px-2">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="px-6 pb-6 space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 font-semibold text-slate-800 text-sm mb-4 uppercase tracking-wide">
                    <div className="w-2 h-2 bg-lime-500 rounded-full" />
                    What's Included
                  </h4>
                  <ul className="space-y-3">
                    {plan.permissions.map((feature, featureIndex) => {
                      const FeatureIcon = getFeatureIcon(
                        getFeatureDescription(feature),
                      );
                      return (
                        <li
                          key={featureIndex}
                          className="flex items-start gap-3 text-sm group/item"
                        >
                          <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center flex-shrink-0 group-hover/item:bg-lime-200 transition-colors duration-200">
                            <FeatureIcon className="h-4 w-4 text-lime-600" />
                          </div>
                          <span className="text-slate-700 leading-relaxed group-hover/item:text-slate-900 transition-colors duration-200">
                            {getFeatureDescription(feature)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {plan.limits.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-slate-800 text-sm mb-3 uppercase tracking-wide">
                      <div
                        className={`w-2 h-2 bg-${config.accent}-500 rounded-full`}
                      />
                      Usage Limits
                    </h4>
                    <div className="flex flex-col gap-2">
                      {plan?.limits?.map((limit, limitIndex) => (
                        <li
                          key={limitIndex}
                          className="flex items-start gap-3 text-sm group/item"
                        >
                          <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center flex-shrink-0 group-hover/item:bg-lime-200 transition-colors duration-200">
                            <Check className="h-4 w-4 text-lime-600" />
                          </div>
                          <span className="text-slate-700 leading-relaxed group-hover/item:text-slate-900 transition-colors duration-200">
                            {limit.limit.toLocaleString()}{" "}
                            {getLimitDescription(limit.key)}
                          </span>
                        </li>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="Coupon code (optional)"
                      className="pl-9 h-10 w-full font-mono uppercase text-sm border-slate-300 focus-visible:ring-lime-500 bg-white"
                    />
                  </div>

                  <Link
                    href={`/payment?plan=${plan._id}&price=${plan.priceCents}${
                      couponCode ? `&coupon=${couponCode}` : ""
                    }`}
                  >
                    <m.div
                      whileHover={{
                        scale: 1.03,
                        y: -2,
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                    >
                      <Button
                        className={`group relative w-full bg-gradient-to-r ${config.button} text-white font-bold text-lg py-6 px-6 rounded-2xl ${config.buttonShadow} ${config.buttonHoverShadow} hover:scale-105 transition-all duration-400 border-0 overflow-hidden`}
                        size="lg"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          <ButtonIcon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                          {config.buttonText}
                          <m.div
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ArrowRight className="h-5 w-5" />
                          </m.div>
                        </span>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Sparkles className="h-4 w-4 text-white/60" />
                        </div>
                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <Sparkles className="h-3 w-3 text-white/40" />
                        </div>
                      </Button>
                    </m.div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </m.div>
        );
      })}
    </m.div>
  );

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="pricing"
        className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-lime-50/50"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-lime-500" />
              <span className="text-sm font-semibold text-lime-600 tracking-wide uppercase">
                Προγράμματα Τιμών
              </span>
              <Sparkles className="h-6 w-6 text-lime-500" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-lime-800 to-lime-800 bg-clip-text text-transparent mb-4">
              Επιλέξτε το Τέλειο Σχέδιο
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Η επαγγελματική διαχείριση καθισμάτων γίνεται απλή. Ξεκινήστε το
              ταξίδι σχεδιασμού της εκδήλωσής σας σήμερα.
            </p>
          </m.div>

          <Tabs
            defaultValue="event"
            className="w-full"
            onValueChange={(value) =>
              setPlanType(
                value === "planner" ? "Planer package" : "Event package",
              )
            }
          >
            <div className="flex justify-center mb-12">
              <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm p-1.5 text-slate-700 shadow-lg border border-lime-200/60">
                <TabsTrigger
                  value="event"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-lime-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-lime-50/50"
                >
                  <Star className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Event Package</span>
                  <span className="sm:hidden">Event</span>
                </TabsTrigger>
                <TabsTrigger
                  value="planner"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-lime-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-lime-50/50"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Planner Package</span>
                  <span className="sm:hidden">Planner</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="planner" className="mt-0">
              {renderPricingCards(plannerPackages || [])}
            </TabsContent>
            <TabsContent value="event" className="mt-0">
              {renderPricingCards(eventPackages || [])}
            </TabsContent>
          </Tabs>

          <m.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 mx-auto w-32 h-1 bg-gradient-to-r from-lime-500 via-lime-500 to-lime-600 rounded-full shadow-lg"
          />
        </div>
      </section>
    </LazyMotion>
  );
}
