"use client";
import { LazyMotion, domAnimation, m } from "motion/react";
import { ArrowRight, Calendar, Users, Share2 } from "lucide-react";

export function HowItWorksSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, x: -60, scale: 0.8 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  const arrowVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.3,
        ease: "easeOut",
      },
    },
  };

  const iconVariants = {
    hidden: { rotate: -180, scale: 0 },
    visible: {
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const steps = [
    {
      number: "1",
      icon: Calendar,
      title: "Create Your Event",
      description:
        "Set up your event with essential details like name, date, location, and logo.",
      gradient: "from-blue-500 to-indigo-600",
      accentColor: "blue",
      iconBg: "bg-blue-100",
      dotColor: "bg-blue-500",
    },
    {
      number: "2",
      icon: Users,
      title: "Manage Guests & Seating",
      description:
        "Import guest lists, design interactive seating charts with drag-and-drop, and assign seats.",
      gradient: "from-indigo-500 to-purple-600",
      accentColor: "indigo",
      iconBg: "bg-indigo-100",
      dotColor: "bg-indigo-500",
    },
    {
      number: "3",
      icon: Share2,
      title: "Share with Guests",
      description:
        "Generate shareable links and QR codes for guests to easily find their seats.",
      gradient: "from-purple-500 to-pink-600",
      accentColor: "purple",
      iconBg: "bg-purple-100",
      dotColor: "bg-purple-500",
    },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="how-it-works"
        className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {/* Header Section */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              How It Works
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-slate-600 leading-relaxed">
              Our intuitive platform makes managing your event seating and
              vendor communications simple.
            </p>
          </m.div>

          {/* Steps Section */}
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-6"
          >
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.number} className="flex items-center">
                  {/* Step Card */}
                  <m.div
                    variants={stepVariants}
                    className="group relative flex flex-col items-center text-center flex-1 min-w-0 space-y-6 p-6 rounded-2xl hover:bg-white/60 transition-all duration-300"
                  >
                    {/* Icon Container */}
                    <div className="relative">
                      {/* Main Circle with Big Icon */}
                      <m.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                        className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center relative overflow-hidden group-hover:shadow-lg transition-all duration-300`}
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

                        {/* Main Big Icon */}
                        <m.div
                          variants={iconVariants}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <IconComponent className="h-12 w-12 text-white relative z-10" />
                        </m.div>
                      </m.div>

                      {/* Step Number Badge */}
                      <m.div
                        variants={iconVariants}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform duration-200"
                      >
                        <span
                          className={`text-sm font-bold text-${step.accentColor}-600`}
                        >
                          {step.number}
                        </span>
                      </m.div>

                      {/* Status Indicator */}
                      <div
                        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full ${step.iconBg} flex items-center justify-center border-2 border-white`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${step.dotColor}`}
                        ></div>
                      </div>

                      {/* Progress Line for Mobile */}
                      {index < steps.length - 1 && (
                        <div className="lg:hidden absolute top-full left-1/2 -translate-x-1/2 mt-4 w-0.5 h-12 bg-gradient-to-b from-slate-300 to-transparent"></div>
                      )}
                    </div>

                    {/* Content */}
                    <m.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="space-y-3 max-w-xs"
                    >
                      <h3
                        className={`text-xl font-bold text-slate-900 group-hover:text-${step.accentColor}-700 transition-colors duration-200`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-sm">
                        {step.description}
                      </p>
                    </m.div>
                  </m.div>

                  {/* Arrow Between Steps */}
                  {index < steps.length - 1 && (
                    <m.div
                      variants={arrowVariants}
                      className="flex items-center justify-center mx-2"
                    >
                      {/* Desktop Arrow */}
                      <m.div
                        whileHover={{ scale: 1.1, x: 3 }}
                        transition={{ duration: 0.2 }}
                        className="hidden lg:flex w-14 h-14 rounded-full bg-gradient-to-r from-slate-100 via-white to-blue-50 items-center justify-center border border-slate-200/60 hover:border-blue-200 transition-all duration-200"
                      >
                        <ArrowRight className="h-6 w-6 text-blue-500" />
                      </m.div>

                      {/* Mobile Arrow */}
                      <m.div
                        whileHover={{ scale: 1.1, y: 3 }}
                        transition={{ duration: 0.2 }}
                        className="flex lg:hidden w-12 h-12 rounded-full bg-gradient-to-b from-slate-100 via-white to-blue-50 items-center justify-center border border-slate-200/60 hover:border-blue-200 transition-all duration-200"
                      >
                        <ArrowRight className="h-5 w-5 text-blue-500 rotate-90" />
                      </m.div>
                    </m.div>
                  )}
                </div>
              );
            })}
          </m.div>

          {/* Bottom Accent */}
          <m.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-16 mx-auto w-32 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
          />
        </div>
      </section>
    </LazyMotion>
  );
}
