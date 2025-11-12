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
      title: "Εξοικονομήστε 10+ Ώρες",
      subtitle: "Ανά Εκδήλωση",
      description:
        "Μετατρέψτε μέρες χειροκίνητου συντονισμού σε λεπτά αυτοματοποιημένης μαγείας. Η έξυπνη πλατφόρμα μας αναλαμβάνει τα πολύπλοκα καθώς εσείς εστιάζετε στη δημιουργία καταπληκτικών εμπειριών.",
      color: "lime",
      stat: "90% Εξοικονόμηση Χρόνου",
      beforeText: "Πριν: 12+ ώρες χειροκίνητης εργασίας",
      afterText: "Μετά: 2 ώρες αβίαστης ρύθμισης",
    },
    {
      icon: Smile,
      title: "Μηδενικό Άγχος Οργάνωσης",
      subtitle: "Εκδηλώσεις Χωρίς Ανησυχίες",
      description:
        "Πείτε αντίο στις αϋπνίες και τον πανικό της τελευταίας στιγμής. Οι αυτοματοποιημένες υπενθυμίσεις και οι ενημερώσεις σε πραγματικό χρόνο διατηρούν τα πάντα ομαλά.",
      color: "emerald",
      stat: "100% Ηρεμία",
      beforeText: "Πριν: Συνεχής ανησυχία και άγχος",
      afterText: "Μετά: Χαλαρή, σίγουρη οργάνωση",
    },
    {
      icon: Heart,
      title: "Ευχαριστημένοι Καλεσμένοι Πάντα",
      subtitle: "Αξέχαστες Εμπειρίες",
      description:
        "Ενθουσιάστε τους καλεσμένους σας με απρόσκοπτο check-in, εύκολη εύρεση θέσεων και ομαλή ροή εκδήλωσης. Τα QR codes κάνουν τα πάντα άμεσα και αβίαστα.",
      color: "green",
      stat: "98% Ικανοποίηση Καλεσμένων",
      beforeText: "Πριν: Μπερδεμένοι, απογοητευμένοι καλεσμένοι",
      afterText: "Μετά: Ενθουσιασμένοι, εντυπωσιασμένοι καλεσμένοι",
    },
    {
      icon: Target,
      title: "Τέλεια Εκτέλεση",
      subtitle: "Κάθε Φορά",
      description:
        "Μην ξεχάσετε ποτέ ξανά καμία λεπτομέρεια. Οι αυτοματοποιημένες υπενθυμίσεις προμηθευτών διασφαλίζουν ότι κάθε προμηθευτής παραδίδει ακριβώς αυτό που χρειάζεστε, ακριβώς όταν το χρειάζεστε.",
      color: "lime",
      stat: "100% Αξιοπιστία",
      beforeText: "Πριν: Χαμένες λεπτομέρειες και καθυστερήσεις",
      afterText: "Μετά: Άψογη εκτέλεση εκδήλωσης",
    },
    {
      icon: TrendingUp,
      title: "Κλιμάκωση Χωρίς Όρια",
      subtitle: "Οποιοδήποτε Μέγεθος Εκδήλωσης",
      description:
        "Από οικεία δείπνα μέχρι μεγάλες εορτές. Η πλατφόρμα μας αναπτύσσεται μαζί με τις φιλοδοξίες σας, διαχειριζόμενη οποιοδήποτε μέγεθος εκδήλωσης με την ίδια ευκολία.",
      color: "green",
      stat: "Απεριόριστη Ανάπτυξη",
      beforeText: "Πριν: Περιορισμένοι από την πολυπλοκότητα",
      afterText: "Μετά: Διαχειριστείτε οποιοδήποτε μέγεθος",
    },
    {
      icon: Star,
      title: "Επαγγελματική Εικόνα",
      subtitle: "Εντυπωσιάστε Κάθε Πελάτη",
      description:
        "Επιδείξτε την εμπειρία σας με εκλεπτυσμένους χάρτες καθισμάτων και απρόσκοπτο συντονισμό. Μετατρέψτε κάθε εκδήλωση σε ευκαιρία συστάσεων.",
      color: "lime",
      stat: "Κριτικές 5 Αστέρων",
      beforeText: "Πριν: Ερασιτεχνική ρύθμιση",
      afterText: "Μετά: Επαγγελματική αριστεία",
    },
  ];

  const getColorConfig = (color) => {
    const configs = {
      lime: {
        bg: "from-lime-50/80 to-lime-100/50",
        border: "border-lime-200/60",
        icon: "from-lime-500 to-lime-600",
        iconText: "text-white",
        accent: "text-lime-600",
        stat: "from-lime-500 to-green-500",
        hover: "hover:from-lime-100/90 hover:to-lime-150/60",
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
      green: {
        bg: "from-green-50/80 to-green-100/50",
        border: "border-green-200/60",
        icon: "from-green-500 to-green-600",
        iconText: "text-white",
        accent: "text-green-600",
        stat: "from-green-500 to-emerald-500",
        hover: "hover:from-green-100/90 hover:to-green-150/60",
      },
    };
    return configs[color];
  };

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-white via-slate-50/30 to-lime-50/20 overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-lime-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
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
              <Sparkles className="h-4 w-4 text-lime-500" />
              <span className="text-slate-700 font-medium text-sm">
                Μεταμορφώστε την Οργάνωση Εκδηλώσεών σας
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Γιατί οι Διοργανωτές Εκδηλώσεων{" "}
              <span className="bg-gradient-to-r from-lime-500 to-lime-600 bg-clip-text text-transparent">
                Λατρεύουν την Πλατφόρμα μας
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Από το χάος στη σαφήνεια. Δείτε πώς η έξυπνη πλατφόρμα μας λύνει
              τις μεγαλύτερες προκλήσεις στην οργάνωση εκδηλώσεων.
            </p>
          </m.div>

          {/* Hero Demo Section with Image */}
          <m.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid lg:grid-cols-2 gap-12 items-center mb-20 p-8 rounded-3xl bg-gradient-to-br from-lime-50/60 to-green-50/60 backdrop-blur-sm border border-lime-200/40"
          >
            {/* Left Side - Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                Δείτε το Σε Δράση
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                Από το Χάος των Υπολογιστικών Φύλλων στην{" "}
                <span className="text-lime-600">Όμορφη Αυτοματοποίηση</span>
              </h3>

              <p className="text-lg text-slate-600 leading-relaxed">
                Δείτε πώς η πλατφόρμα μας μετατρέπει τον περίπλοκο συντονισμό
                εκδηλώσεων σε μια απλή, οπτική εμπειρία. Όχι άλλα ατελείωτα
                υπολογιστικά φύλλα ή ξεχασμένες λεπτομέρειες.
              </p>

              {/* Quick Features */}
              <div className="space-y-3">
                {[
                  {
                    icon: Monitor,
                    text: "Δημιουργός χαρτών καθισμάτων με σύρσιμο και απόθεση",
                  },
                  {
                    icon: Smartphone,
                    text: "Φιλικό για κινητά για τους καλεσμένους",
                  },
                  { icon: Zap, text: "Άμεσες ειδοποιήσεις προμηθευτών" },
                ].map((feature, index) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center">
                        <FeatureIcon className="h-4 w-4 text-lime-600" />
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
                  alt="Πλατφόρμα Διαχείρισης Εκδηλώσεων"
                  className="w-full h-auto"
                  width={1500}
                  height={1500}
                />
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-lime-400 to-green-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-lime-400 to-green-500 rounded-full opacity-15 blur-2xl"></div>
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
                            ΠΡΙΝ
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
                            ΜΕΤΑ
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
            className="text-center mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-lime-50/80 via-green-50/80 to-lime-50/80 backdrop-blur-sm border border-lime-200/40"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Users className="h-6 w-6 text-lime-500" />
                <span className="text-lime-600 font-semibold">
                  Ενταχθείτε σε 1000+ Ευχαριστημένους Διοργανωτές Εκδηλώσεων
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Έτοιμοι να Μεταμορφώσετε τις Εκδηλώσεις σας;
              </h3>

              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Σταματήστε να αφήνετε το άγχος της οργάνωσης εκδηλώσεων να
                καταναλώνει τον χρόνο σας. Αρχίστε να δημιουργείτε αξέχαστες
                εμπειρίες με αυτοπεποίθηση και ευκολία.
              </p>

              {/* Trust Signals */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Δωρεάν δοκιμή 14 ημερών</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <Shield className="h-4 w-4 text-lime-500" />
                  <span>Χωρίς τέλη εγκατάστασης</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span>Ακύρωση ανά πάσα στιγμή</span>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}
