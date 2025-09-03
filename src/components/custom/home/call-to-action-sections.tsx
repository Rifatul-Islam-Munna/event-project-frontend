"use client";
import { LazyMotion, domAnimation, m } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export function CallToActionSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.3,
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative w-full py-20 md:py-28 lg:py-36 bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-600 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10"></div>

        {/* Floating Icons */}
        <m.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 left-10 md:left-20 opacity-20"
        >
          <Sparkles className="h-12 w-12 text-white" />
        </m.div>

        <m.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
          className="absolute top-32 right-16 md:right-32 opacity-20"
        >
          <Zap className="h-16 w-16 text-white" />
        </m.div>

        <m.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "4s" }}
          className="absolute bottom-20 left-1/4 opacity-15"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </m.div>

        {/* Animated Background Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <m.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <m.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Main Heading */}
            <m.div variants={itemVariants} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-white/90 text-sm font-medium">
                  Transform Your Events
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Ready to{" "}
                <span className="relative">
                  <span className="relative z-10 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Simplify
                  </span>
                  <m.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="absolute bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-yellow-300/30 to-orange-300/30 -skew-x-12"
                  />
                </span>
                <br />
                Your Event Planning?
              </h2>
            </m.div>

            {/* Description */}
            <m.p
              variants={itemVariants}
              className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto"
            >
              Create interactive seating charts, manage guest lists, and
              automate vendor reminders with ease. Get started today and make
              your event unforgettable.
            </m.p>

            {/* Features List */}
            <m.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-4 md:gap-6 pt-4"
            >
              {[
                "Interactive Seating Charts",
                "Smart Guest Management",
                "Automated Reminders",
                "QR Code Generation",
              ].map((feature, index) => (
                <m.div
                  key={feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20"
                >
                  <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                  <span className="text-white/90 text-sm font-medium">
                    {feature}
                  </span>
                </m.div>
              ))}
            </m.div>

            {/* CTA Button */}
            <m.div
              variants={buttonVariants}
              className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8"
            >
              <m.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="lg"
                  asChild
                  className="group bg-white text-slate-900 hover:bg-yellow-50 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl px-8 py-6 font-semibold text-lg h-auto min-w-[200px]"
                >
                  <Link href="/dashboard" className="flex items-center gap-3">
                    Get Started Now
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </Button>
              </m.div>

              <m.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-white/80 text-sm"
              >
                ✨ No credit card required • Free trial available
              </m.div>
            </m.div>

            {/* Social Proof */}
            <m.div
              variants={itemVariants}
              className="pt-8 border-t border-white/20"
            >
              <p className="text-white/70 text-sm mb-4">
                Trusted by event organizers worldwide
              </p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-16 h-8 bg-white/20 rounded backdrop-blur-sm"
                  ></div>
                ))}
              </div>
            </m.div>
          </m.div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-auto text-white/10"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64L48,69.3C96,75,192,85,288,85.3C384,85,480,75,576,69.3C672,64,768,64,864,58.7C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>
    </LazyMotion>
  );
}
