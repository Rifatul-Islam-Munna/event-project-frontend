"use client";
import { LazyMotion, domAnimation, m } from "motion/react";
import {
  Clock,
  Heart,
  Users,
  Sparkles,
  CheckCircle,
  Zap,
  Shield,
  TrendingUp,
  Globe,
  MessageCircle,
  Calendar,
  Star,
  ArrowRight,
  Timer,
  Smile,
  Target,
  Monitor,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import sideImage from "@/assets/side_image.avif";

export function BenefitsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, x: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const benefits = [
    {
      icon: Timer,
      title: "Save 10+ Hours",
      subtitle: "Per Event Setup",
      description:
        "Transform days of manual coordination into minutes of automated magic. Our smart platform handles the complex stuff while you focus on creating amazing experiences.",
      color: "orange",
      stat: "90% Time Saved",
      beforeText: "Before: 12+ hours of manual work",
      afterText: "After: 2 hours of effortless setup",
    },
    {
      icon: Smile,
      title: "Zero Stress Planning",
      subtitle: "Worry-Free Events",
      description:
        "Say goodbye to sleepless nights and last-minute panic. Automated reminders and real-time updates keep everything running smoothly.",
      color: "emerald",
      stat: "100% Peace of Mind",
      beforeText: "Before: Constant worry and stress",
      afterText: "After: Relaxed, confident planning",
    },
    {
      icon: Heart,
      title: "Happy Guests Always",
      subtitle: "Memorable Experiences",
      description:
        "Delight your guests with seamless check-ins, easy seat finding, and smooth event flow. QR codes make everything instant and effortless.",
      color: "rose",
      stat: "98% Guest Satisfaction",
      beforeText: "Before: Confused, frustrated guests",
      afterText: "After: Delighted, impressed attendees",
    },
    {
      icon: Target,
      title: "Perfect Execution",
      subtitle: "Every Single Time",
      description:
        "Never miss a detail again. Automated vendor reminders ensure every supplier delivers exactly what you need, exactly when you need it.",
      color: "red",
      stat: "100% Reliability",
      beforeText: "Before: Missed details and delays",
      afterText: "After: Flawless event execution",
    },
    {
      icon: TrendingUp,
      title: "Scale Without Limits",
      subtitle: "Any Event Size",
      description:
        "From intimate dinners to grand celebrations. Our platform grows with your ambitions, handling any event size with the same ease.",
      color: "orange",
      stat: "Unlimited Growth",
      beforeText: "Before: Limited by complexity",
      afterText: "After: Handle any event size",
    },
    {
      icon: Star,
      title: "Professional Image",
      subtitle: "Impress Every Client",
      description:
        "Showcase your expertise with polished seating charts and seamless coordination. Turn every event into a referral opportunity.",
      color: "amber",
      stat: "5-Star Reviews",
      beforeText: "Before: Amateur-looking setup",
      afterText: "After: Professional excellence",
    },
  ];

  const getColorConfig = (color) => {
    const configs = {
      orange: {
        bg: "from-orange-50/80 to-orange-100/50",
        border: "border-orange-200/60",
        icon: "from-orange-500 to-orange-600",
        iconText: "text-white",
        accent: "text-orange-600",
        stat: "from-orange-500 to-red-500",
        hover: "hover:from-orange-100/90 hover:to-orange-150/60",
      },
      emerald: {
        bg: "from-emerald-50/80 to-emerald-100/50",
        border: "border-emerald-200/60",
        icon: "from-emerald-500 to-emerald-600",
        iconText: "text-white",
        accent: "text-emerald-600",
        stat: "from-emerald-500 to-teal-500",
        hover: "hover:from-emerald-100/90 hover:to-emerald-150/60",
      },
      rose: {
        bg: "from-rose-50/80 to-rose-100/50",
        border: "border-rose-200/60",
        icon: "from-rose-500 to-rose-600",
        iconText: "text-white",
        accent: "text-rose-600",
        stat: "from-rose-500 to-pink-500",
        hover: "hover:from-rose-100/90 hover:to-rose-150/60",
      },
      red: {
        bg: "from-red-50/80 to-red-100/50",
        border: "border-red-200/60",
        icon: "from-red-500 to-red-600",
        iconText: "text-white",
        accent: "text-red-600",
        stat: "from-red-500 to-rose-500",
        hover: "hover:from-red-100/90 hover:to-red-150/60",
      },
      amber: {
        bg: "from-amber-50/80 to-amber-100/50",
        border: "border-amber-200/60",
        icon: "from-amber-500 to-amber-600",
        iconText: "text-white",
        accent: "text-amber-600",
        stat: "from-amber-500 to-orange-500",
        hover: "hover:from-amber-100/90 hover:to-amber-150/60",
      },
    };
    return configs[color];
  };

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-white via-slate-50/30 to-orange-50/20 overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          {/* Enhanced Header */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 mb-6">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span className="text-slate-700 font-medium text-sm">
                Transform Your Event Planning
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Why Event Organizers{" "}
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                Love Our Platform
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From chaos to clarity. See how our intelligent platform solves the
              biggest challenges in event planning.
            </p>
          </m.div>

          {/* Hero Demo Section with Image */}
          <m.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid lg:grid-cols-2 gap-12 items-center mb-20 p-8 rounded-3xl bg-gradient-to-br from-orange-50/60 to-red-50/60 backdrop-blur-sm border border-orange-200/40"
          >
            {/* Left Side - Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                See It In Action
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                From Spreadsheet Chaos to{" "}
                <span className="text-orange-600">Beautiful Automation</span>
              </h3>

              <p className="text-lg text-slate-600 leading-relaxed">
                Watch how our platform transforms complex event coordination
                into a simple, visual experience. No more endless spreadsheets
                or forgotten details.
              </p>

              {/* Quick Features */}
              <div className="space-y-3">
                {[
                  { icon: Monitor, text: "Drag & drop seating chart builder" },
                  { icon: Smartphone, text: "Mobile-friendly for guests" },
                  { icon: Zap, text: "Instant vendor notifications" },
                ].map((feature, index) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <FeatureIcon className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-slate-700 font-medium">
                        {feature.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Platform Image */}
            <m.div
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={sideImage}
                  alt="Event Management Platform"
                  className="w-full h-auto"
                  width={1500}
                  height={1500}
                />
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-15 blur-2xl"></div>
            </m.div>
          </m.div>

          {/* Enhanced Benefits Grid */}
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
            className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              const colorConfig = getColorConfig(benefit.color);

              return (
                <m.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3, ease: "easeOut" },
                  }}
                  className="group relative"
                >
                  <div
                    className={`h-full p-6 md:p-8 rounded-3xl bg-gradient-to-br ${colorConfig.bg} ${colorConfig.hover} border ${colorConfig.border} backdrop-blur-sm transition-all duration-500 hover:shadow-xl`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        {/* Icon */}
                        <m.div
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${colorConfig.icon} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow duration-300`}
                        >
                          <IconComponent
                            className={`h-7 w-7 ${colorConfig.iconText}`}
                          />
                        </m.div>

                        {/* Title & Subtitle */}
                        <div className="space-y-1 mb-3">
                          <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                            {benefit.title}
                          </h3>
                          <p
                            className={`text-sm font-medium ${colorConfig.accent}`}
                          >
                            {benefit.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Stat Badge */}
                      <div
                        className={`px-3 py-1 rounded-full bg-gradient-to-r ${colorConfig.stat} text-white text-xs font-bold whitespace-nowrap ml-4`}
                      >
                        {benefit.stat}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-700 leading-relaxed mb-6 group-hover:text-slate-800 transition-colors duration-200">
                      {benefit.description}
                    </p>

                    {/* Before/After Comparison */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50/60 border border-red-200/40">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-700 mb-1">
                            BEFORE
                          </p>
                          <p className="text-sm text-slate-700">
                            {benefit.beforeText}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50/60 border border-green-200/40">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-700 mb-1">
                            AFTER
                          </p>
                          <p className="text-sm text-slate-700">
                            {benefit.afterText}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${colorConfig.stat} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                    ></div>
                  </div>
                </m.div>
              );
            })}
          </m.div>

          {/* Enhanced CTA Section */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-orange-50/80 via-red-50/80 to-orange-50/80 backdrop-blur-sm border border-orange-200/40"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Users className="h-6 w-6 text-orange-500" />
                <span className="text-orange-600 font-semibold">
                  Join 1000+ Happy Event Organizers
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Ready to Transform Your Events?
              </h3>

              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Stop letting event planning stress consume your time. Start
                creating memorable experiences with confidence and ease.
              </p>

              {/* Trust Signals */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free 14-day trial</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <Shield className="h-4 w-4 text-orange-500" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}
