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
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Crown,
  Zap,
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
  Download,
} from "lucide-react";
import Link from "next/link";

interface PricingSectionProps {
  plans: PricingPlan[];
}

export function PricingSection() {
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

  const formatBillingUnit = (unit: string) => {
    switch (unit) {
      case "PER_MONTH":
        return "/month";
      case "PER_YEAR":
        return "/year";
      case "PER_EVENT":
        return "/event";
      default:
        return `/${unit.toLowerCase()}`;
    }
  };

  const getPlanConfig = (index: number) => {
    const configs = [
      {
        gradient: "from-lime-50 to-green-50",
        border: "border-lime-200/60",
        button: "from-lime-500 via-lime-600 to-green-600",
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
        gradient: "from-green-50 to-emerald-50",
        border: "border-green-200/60",
        button: "from-green-500 via-green-600 to-emerald-600",
        buttonShadow: "shadow-[0_8px_32px_rgba(34,197,94,0.4)]",
        buttonHoverShadow: "hover:shadow-[0_12px_40px_rgba(34,197,94,0.6)]",
        icon: Crown,
        iconColor: "text-green-600",
        accent: "green",
        buttonText: "Claim Your Plan",
        buttonIcon: Crown,
        tier: "Professional",
      },
      {
        gradient: "from-lime-50 to-lime-50",
        border: "border-lime-200/60",
        button: "from-lime-600 via-lime-600 to-green-500",
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
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="pricing"
        className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-lime-50/50"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {/* Enhanced Header with Icons */}
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
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-lime-800 to-green-800 bg-clip-text text-transparent mb-4">
              Επιλέξτε το Τέλειο Σχέδιο
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Η επαγγελματική διαχείριση καθισμάτων γίνεται απλή. Ξεκινήστε το
              ταξίδι σχεδιασμού της εκδήλωσής σας σήμερα.
            </p>
          </m.div>

          {/* Enhanced Pricing Cards */}
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="grid max-w-5xl mx-auto gap-6 lg:grid-cols-3"
          >
            {data?.data?.map((plan, index) => {
              const config = getPlanConfig(index);
              const isPopular = index === 1;
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
                    className={`relative h-full bg-gradient-to-br ${
                      config.gradient
                    } border ${
                      config.border
                    } rounded-2xl transition-all duration-300 hover:shadow-lg ${
                      isPopular ? "ring-2 ring-green-300 scale-105" : ""
                    }`}
                  >
                    {/* Enhanced Popular Badge */}
                    {isPopular && (
                      <m.div
                        variants={pulseVariants}
                        animate="animate"
                        className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10"
                      >
                        <div className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                          <Crown className="h-4 w-4" />
                          Most Popular
                          <Sparkles className="h-3 w-3" />
                        </div>
                      </m.div>
                    )}

                    {/* Enhanced Header with Beautiful Icons */}
                    <CardHeader className="text-center pb-4 pt-8 px-6 space-y-4">
                      <div className="flex items-center justify-center mb-3">
                        <m.div
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          className="relative w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300"
                        >
                          <IconComponent
                            className={`h-8 w-8 ${config.iconColor}`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent rounded-2xl"></div>
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
                          {formatPrice(plan.priceCents, plan.currency)}
                        </span>
                        <span className="text-slate-500 text-sm font-medium">
                          {formatBillingUnit(plan.billingUnit)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 px-2">
                        {plan.description}
                      </p>
                    </CardHeader>

                    {/* Enhanced Content with Feature Icons */}
                    <CardContent className="px-6 pb-6 space-y-6">
                      {/* Enhanced Features with Icons */}
                      <div>
                        <h4 className="flex items-center gap-2 font-semibold text-slate-800 text-sm mb-4 uppercase tracking-wide">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          What's Included
                        </h4>
                        <ul className="space-y-3">
                          {plan.permissions
                            .slice(0, 4)
                            .map((feature, featureIndex) => {
                              const FeatureIcon = getFeatureIcon(
                                getFeatureDescription(feature)
                              );
                              return (
                                <li
                                  key={featureIndex}
                                  className="flex items-start gap-3 text-sm group/item"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 group-hover/item:bg-green-200 transition-colors duration-200">
                                    <FeatureIcon className="h-4 w-4 text-green-600" />
                                  </div>
                                  <span className="text-slate-700 leading-relaxed group-hover/item:text-slate-900 transition-colors duration-200">
                                    {getFeatureDescription(feature)}
                                  </span>
                                </li>
                              );
                            })}
                          {plan.permissions.length > 4 && (
                            <li className="flex items-center gap-2 text-sm text-slate-500 pl-11">
                              <Sparkles className="h-4 w-4" />+
                              {plan.permissions.length - 4} more premium
                              features
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Enhanced Limits */}
                      {plan.limits.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 font-semibold text-slate-800 text-sm mb-3 uppercase tracking-wide">
                            <div
                              className={`w-2 h-2 bg-${config.accent}-500 rounded-full`}
                            ></div>
                            Usage Limits
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {plan.limits.map((limit, limitIndex) => (
                              <div
                                key={limitIndex}
                                className="flex items-center gap-1 bg-white/80 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200/50"
                              >
                                <Star className="h-3 w-3 text-yellow-500" />
                                {limit.limit.toLocaleString()}{" "}
                                {getLimitDescription(limit.key)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Super Attractive CTA Button */}
                      <Link
                        href={`/payment?plan=${plan._id}&price=${plan.priceCents}`}
                      >
                        <m.div
                          whileHover={{
                            scale: 1.03,
                            y: -2,
                            transition: { duration: 0.2 },
                          }}
                          whileTap={{
                            scale: 0.98,
                            transition: { duration: 0.1 },
                          }}
                          className="pt-4"
                        >
                          <Button
                            className={`group relative w-full bg-gradient-to-r ${config.button} text-white font-bold text-lg py-6 px-6 rounded-2xl ${config.buttonShadow} ${config.buttonHoverShadow} hover:scale-105 transition-all duration-400 border-0 overflow-hidden`}
                            size="lg"
                          >
                            {/* Animated Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

                            {/* Pulsing Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Button Content */}
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

                            {/* Corner Sparkles */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Sparkles className="h-4 w-4 text-white/60" />
                            </div>
                            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <Sparkles className="h-3 w-3 text-white/40" />
                            </div>
                          </Button>
                        </m.div>
                      </Link>

                      {/* Trust Signal */}
                      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-500">
                        <Shield className="h-4 w-4" />
                        <span>30-day money-back guarantee</span>
                      </div>
                    </CardContent>
                  </Card>
                </m.div>
              );
            })}
          </m.div>

          {/* Enhanced Bottom Accent */}
          <m.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 mx-auto w-32 h-1 bg-gradient-to-r from-lime-500 via-green-500 to-lime-600 rounded-full shadow-lg"
          />
        </div>
      </section>
    </LazyMotion>
  );
}
