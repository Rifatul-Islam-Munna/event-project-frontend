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
      title: "Ομαλή ροή στην είσοδο και καθισμάτων",
      description: "Χωρίς συνωστισμό και σύγχυση",
    },
    {
      icon: CheckCircle2,
      title: "Άψογη εκτέλεση του πλάνου",
      description: "Όλα στη θέση τους",
    },
  ];

  return (
    <section className="w-full py-16 md:py-20 lg:py-24 bg-gradient-to-br from-white via-lime-50/20 to-slate-50/30">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent mb-4">
            Εντυπωσιάστε τους καλεσμένους σας
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-white to-lime-50/50 rounded-2xl p-6 md:p-8 border-2 border-lime-200/60 hover:border-lime-400/80 transition-all duration-300 "
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 group-hover:text-lime-700 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-600 text-base md:text-lg">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
