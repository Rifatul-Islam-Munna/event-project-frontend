import {
  getFeatureDescription,
  getLimitDescription,
} from "@/@types/feature-mapping";
import { PricingPlan } from "@/@types/pricing";
import { getAllThePlans } from "@/actions/fetch-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
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

  const getPlanGradient = (index: number) => {
    const gradients = [
      { bg: "from-slate-50 to-blue-50", button: "from-slate-600 to-blue-600" },
      {
        bg: "from-blue-50 to-indigo-50",
        button: "from-blue-600 to-indigo-600",
      },
      {
        bg: "from-indigo-50 to-purple-50",
        button: "from-indigo-600 to-purple-600",
      },
    ];
    return gradients[index % gradients.length];
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-blue-50/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Plans & Pricing
            </h2>
            <p className="max-w-[900px] text-slate-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Choose the perfect plan for your event. Professional seating
              management made simple and affordable.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl items-start gap-6 py-12 lg:grid-cols-3">
          {data?.data?.map((plan, index) => {
            const gradient = getPlanGradient(index);
            const isPopular = index === 1; // Middle plan is popular

            return (
              <Card
                key={plan._id}
                className={`group relative flex flex-col h-full bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl hover:bg-white/90 hover:scale-[1.02] transition-all duration-500 ${
                  isPopular ? "ring-2 ring-blue-200 scale-105" : ""
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader
                  className={`text-center bg-gradient-to-br ${gradient.bg} rounded-t-3xl relative overflow-hidden p-8`}
                >
                  <CardTitle className="text-2xl font-bold text-slate-800 relative z-10">
                    {plan.title}
                  </CardTitle>
                  <div className="flex items-baseline justify-center gap-1 relative z-10 my-4">
                    <span className="text-4xl font-bold text-slate-900">
                      {formatPrice(plan.priceCents, plan.currency)}
                    </span>
                    <span className="text-slate-600">
                      {formatBillingUnit(plan.billingUnit)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 relative z-10">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 p-8 bg-white/80 backdrop-blur-sm rounded-b-3xl">
                  <div className="space-y-6 mb-8">
                    {/* Features */}
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-3">
                        Features
                      </h4>
                      <ul className="space-y-2">
                        {plan.permissions.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start gap-3"
                          >
                            <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-600 text-sm leading-relaxed">
                              {getFeatureDescription(feature)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limits */}
                    {plan.limits.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-3">
                          Limits
                        </h4>
                        <ul className="space-y-2">
                          {plan.limits.map((limit, limitIndex) => (
                            <li
                              key={limitIndex}
                              className="flex items-start gap-3"
                            >
                              <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-600 text-sm leading-relaxed">
                                {getLimitDescription(limit.key)}:{" "}
                                {limit.limit.toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/payment?plan=${plan._id}&price=${plan.priceCents}`}
                  >
                    <Button
                      className={`w-full bg-gradient-to-r ${gradient.button} text-white hover:opacity-90 hover:scale-105 transition-all duration-300 rounded-2xl py-6 text-base font-medium`}
                      size="lg"
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
