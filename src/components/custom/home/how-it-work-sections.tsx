"use client";
import { LazyMotion, domAnimation, m } from "motion/react";
import { ArrowRight, Calendar, Users, Share2 } from "lucide-react";
import Image from "next/image";
import image1 from "@/assets/hero/image1.avif";
import image2 from "@/assets/hero/image2.avif";
import image3 from "@/assets/hero/image3.avif";

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
      title: "Δημιουργήστε την Εκδήλωσή σας",
      description:
        "Δημιουργήστε την Εκδήλωσή σας.\nΟργανώστε την εκδήλωσή σας με βασικές λεπτομέρειες όπως όνομα, ημερομηνία, τοποθεσία και λογότυπο.",
      gradient: "from-lime-500 to-lime-600",
      accentColor: "lime",
      image: image1,
    },
    {
      number: "2",
      icon: Users,
      title: "Διαχειριστείτε Καλεσμένους & Καθίσματα",
      description:
        "Διαχειριστείτε τους Καλεσμένους & τα Καθίσματα. Εισάγετε τις λίστες καλεσμένων, σχεδιάστε διαδραστικούς χάρτες καθισμάτων με drag & drop και αναθέστε θέσεις.",
      gradient: "from-green-500 to-green-600",
      accentColor: "green",
      image: image2,
    },
    {
      number: "3",
      icon: Share2,
      title: "Μοιραστείτε τη με τους Καλεσμένους",
      description:
        "Μοιραστείτε με τους Καλεσμένους.\nΔημιουργήστε συνδέσμους και QR codes για εύκολη εύρεση των θέσεων των καλεσμένων.",
      gradient: "from-lime-600 to-lime-600",
      accentColor: "lime",
      image: image3,
    },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="how-it-works"
        className="w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-white via-slate-50/50 to-lime-50/30"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-6 max-w-7xl">
          {/* Header Section */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight bg-gradient-to-r from-lime-500 to-lime-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-4">
              Τρόπος Λειτουργίας
            </h2>
            <p className="max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 leading-relaxed px-4">
              Η εύχρηστη πλατφόρμα μας απλοποιεί τη διαχείριση καθισμάτων της
              εκδήλωσής σας και την επικοινωνία με τους προμηθευτές
            </p>
          </m.div>

          {/* Steps Section */}
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="max-w-6xl mx-auto flex flex-col sm:flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-4 xl:gap-6"
          >
            {/* Step Cards */}
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex flex-col lg:flex-row items-center w-full lg:w-auto"
                >
                  {/* Step Card */}
                  <m.div
                    variants={stepVariants}
                    className="group relative flex flex-col items-center text-center flex-1 min-w-0 space-y-4 sm:space-y-6 p-4 sm:p-6 rounded-2xl hover:bg-white/60 transition-all duration-300 w-full max-w-sm lg:max-w-xs"
                  >
                    {/* Image Container with Icon Overlay */}
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-2">
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                      {/* Icon directly on image */}

                      {/* Step Number Badge */}
                      <m.div
                        variants={iconVariants}
                        className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <span
                          className={`text-sm sm:text-base font-bold text-${step.accentColor}-600`}
                        >
                          {step.number}
                        </span>
                      </m.div>

                      {/* Arrow positioned at bottom right of image */}

                      {/* Mobile Arrow below image */}
                      {index < steps.length - 1 && (
                        <m.div
                          variants={arrowVariants}
                          className="absolute -bottom-6 left-1/2 -translate-x-1/2 lg:hidden z-20"
                        >
                          <m.div
                            whileHover={{ scale: 1.1, y: 3 }}
                            transition={{ duration: 0.2 }}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-lime-200"
                          >
                            <ArrowRight className="h-5 w-5 text-lime-500 rotate-90" />
                          </m.div>
                        </m.div>
                      )}
                    </div>

                    {/* Content */}
                    <m.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="space-y-2 sm:space-y-3 max-w-xs sm:max-w-sm lg:max-w-xs px-2 sm:px-0"
                    >
                      <h3 className="text-lg sm:text-xl md:text-xl font-bold text-slate-900 group-hover:text-lime-700 transition-colors duration-200">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-xs sm:text-sm md:text-sm">
                        {step.description}
                      </p>
                    </m.div>
                  </m.div>
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
            className="mt-12 sm:mt-16 mx-auto w-24 sm:w-32 h-1 bg-gradient-to-r from-lime-500 via-green-500 to-lime-600 rounded-full"
          />
        </div>
      </section>
    </LazyMotion>
  );
}
