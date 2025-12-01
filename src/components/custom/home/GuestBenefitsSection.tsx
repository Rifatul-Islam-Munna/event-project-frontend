"use client";
import { motion } from "framer-motion";
import { QrCode, Clock, Users, CheckCircle2 } from "lucide-react";

export function GuestBenefitsSection() {
  const benefits = [
    {
      icon: Clock,
      title: "Γρήγορο check-in",
      description: "Εξοικονόμηση χρόνου στην είσοδο",
    },
    {
      icon: QrCode,
      title: "Άμεση εύρεση θέσης μέσω QR Code",
      description: "Σκανάρετε και βρείτε αμέσως",
    },
    {
      icon: Users,
      title: "Ομαλή ροή στην είσοδο",
      description: "Χωρίς συνωστισμό και σύγχυση",
    },
    {
      icon: CheckCircle2,
      title: "Άψογη εκτέλεση του πλάνου",
      description: "Όλα στη θέση τους",
    },
  ];

  return (
    <section className="w-full py-12  xl:py-14 bg-gradient-to-br from-white via-lime-50/20 to-slate-50/30">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
            Εντυπωσιάστε τους{" "}
            <span className="bg-gradient-to-r from-lime-500 via-lime-600 to-lime-600 bg-clip-text text-transparent">
              καλεσμένους σας
            </span>
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            Παρέχετε μια σύγχρονη και επαγγελματική εμπειρία σε κάθε εκδήλωση
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:border-lime-300 hover:shadow-md transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-lime-500/10 flex items-center justify-center mb-4">
                  <IconComponent className="h-6 w-6 text-lime-600" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
