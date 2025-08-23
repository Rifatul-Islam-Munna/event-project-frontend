import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  const plans = [
    {
      name: "Basic Plan",
      price: "$19",
      period: "/event",
      description: "Perfect for small events and personal celebrations",
      gradient: "from-slate-50 to-blue-50",
      buttonGradient: "from-slate-600 to-blue-600",
      features: [
        "Up to 50 guests",
        "Drag & drop seating chart",
        "QR code generation",
        "Guest lookup system",
        "Basic email notifications",
        "Mobile responsive design",
      ],
    },
    {
      name: "Professional",
      price: "$49",
      period: "/event",
      description: "Ideal for wedding planners and event coordinators",
      gradient: "from-blue-50 to-indigo-50",
      buttonGradient: "from-blue-600 to-indigo-600",
      popular: true,
      features: [
        "Up to 200 guests",
        "Advanced seating arrangements",
        "QR code & shareable links",
        "CSV guest list import",
        "Vendor reminder system",
        "WhatsApp & email automation",
        "Custom event branding",
        "Priority support",
      ],
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/event",
      description: "For large-scale events and corporate functions",
      gradient: "from-indigo-50 to-purple-50",
      buttonGradient: "from-indigo-600 to-purple-600",
      features: [
        "Unlimited guests",
        "Multiple seating areas",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated account manager",
        "White-label solution",
        "API access",
        "24/7 premium support",
      ],
    },
  ];

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
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`group relative flex flex-col h-full bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl hover:bg-white/90 hover:scale-[1.02] transition-all duration-500 ${
                plan.popular ? "ring-2 ring-blue-200 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader
                className={`text-center bg-gradient-to-br ${plan.gradient} rounded-t-3xl relative overflow-hidden p-8`}
              >
                <CardTitle className="text-2xl font-bold text-slate-800 relative z-10">
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline justify-center gap-1 relative z-10 my-4">
                  <span className="text-4xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-slate-600">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-600 relative z-10">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="flex-1 p-8 bg-white/80 backdrop-blur-sm rounded-b-3xl">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-sm leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href={"/payment"}>
                  <Button
                    className={`w-full bg-gradient-to-r ${plan.buttonGradient} text-white hover:opacity-90 hover:scale-105 transition-all duration-300 rounded-2xl py-6 text-base font-medium`}
                    size="lg"
                  >
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
