"use client";
import { LazyMotion, domAnimation, m } from "motion/react";
import { ArrowRight, Calendar, Users, Share2 } from "lucide-react";
import Image from "next/image";
import image1 from "@/assets/hero/imageone.jpeg";
import image2 from "@/assets/hero/image2.jpeg";
import image3 from "@/assets/hero/image3.jpeg";

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

  const steps = [
    {
      number: "1",
      icon: Calendar,
      title: "Δημιουργήστε την εκδήλωσή σας",
      description:
        "Δημιουργήστε την εκδήλωσή σας (όνομα, ημερομηνία, τοποθεσία, λογότυπο).",
      gradient: "from-lime-500 to-lime-600",
      accentColor: "lime",
      image: image1,
    },
    {
      number: "2",
      icon: Users,
      title: "Εισάγετε τη λίστα καλεσμένων",
      description:
        "Εισάγετε τη λίστα καλεσμένων και τοποθετήστε τους εύκολα με drag & drop.",
      gradient: "from-green-500 to-green-600",
      accentColor: "green",
      image: image2,
    },
    {
      number: "3",
      icon: Share2,
      title: "Μοιραστείτε links ή QR Codes",
      description:
        "Μοιραστείτε links ή QR Codes, ώστε να βρίσκουν άμεσα τις θέσεις τους.",
      gradient: "from-lime-600 to-lime-600",
      accentColor: "lime",
      image: image3,
    },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="how-it-works"
        className="w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-white via-slate-50/50 to-lime-50/30"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-[1600px]">
          {/* Header Section */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16 sm:mb-20 md:mb-24"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight bg-gradient-to-r from-lime-500 to-lime-600 bg-clip-text text-transparent mb-4 sm:mb-6 px-4">
              Πώς λειτουργεί
            </h2>
            <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 leading-relaxed px-4">
              Απολαύστε μια οργανωμένη, γρήγορη και χωρίς άγχος προετοιμασία
            </p>
          </m.div>

          {/* Steps Section */}
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-6 xl:gap-10"
          >
            {/* Step Cards */}
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center w-full lg:flex-1"
                >
                  {/* Step Card */}
                  <m.div
                    variants={stepVariants}
                    className="group relative flex flex-col items-center text-center w-full space-y-6 sm:space-y-8 p-6 sm:p-8 rounded-3xl hover:bg-white/60 transition-all duration-300"
                  >
                    {/* Image Container - BIG 1:1 SQUARE */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4">
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Mobile Arrow below image */}
                      {index < steps.length - 1 && (
                        <m.div
                          variants={arrowVariants}
                          className="absolute -bottom-8 left-1/2 -translate-x-1/2 lg:hidden z-20"
                        >
                          <m.div
                            whileHover={{ scale: 1.1, y: 3 }}
                            transition={{ duration: 0.2 }}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-lime-200"
                          >
                            <ArrowRight className="h-6 w-6 text-lime-500 rotate-90" />
                          </m.div>
                        </m.div>
                      )}
                    </div>

                    {/* Content - BIGGER TEXT */}
                    <m.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="space-y-3 sm:space-y-4 w-full"
                    >
                      <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-slate-900 group-hover:text-lime-700 transition-colors duration-200 leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-base sm:text-lg md:text-xl lg:text-xl">
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
            className="mt-16 sm:mt-20 mx-auto w-32 sm:w-40 h-1 bg-gradient-to-r from-lime-500 via-green-500 to-lime-600 rounded-full"
          />
        </div>
      </section>
    </LazyMotion>
  );
}
