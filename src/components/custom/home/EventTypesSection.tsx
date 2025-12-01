"use client";
import { motion } from "framer-motion";
import { PartyPopper, Users2, Cake, Heart, Briefcase } from "lucide-react";

export function EventTypesSection() {
  const eventTypes = [
    { icon: Heart, label: "Γάμοι" },
    { icon: Cake, label: "Πάρτι" },
    { icon: Users2, label: "Συνέδρια" },
    { icon: Briefcase, label: "Εταιρικά Events" },
  ];

  return (
    <section className="w-full py-12 xl:py-14 bg-gradient-to-br from-lime-50/30 via-white to-slate-50/50">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8"
        >
          {/* Heading */}
          <div>
            <div className="inline-flex items-center gap-3 mb-3">
              <PartyPopper className="h-8 w-8 text-lime-600" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
                Για κάθε είδους{" "}
                <span className="bg-gradient-to-r from-lime-500 via-lime-600 to-lime-600 bg-clip-text text-transparent">
                  εκδήλωση
                </span>
              </h2>
            </div>
            <p className="text-slate-600 text-base md:text-lg max-w-3xl mx-auto">
              Από μικρές, ιδιωτικές συγκεντρώσεις μέχρι μεγάλες γιορτές — η
              πλατφόρμα προσαρμόζεται σε κάθε ανάγκη, χωρίς περιορισμούς.
            </p>
          </div>

          {/* Event Types Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto pt-4">
            {eventTypes.map((event, index) => {
              const IconComponent = event.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-slate-200 hover:border-lime-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-lime-500/10 flex items-center justify-center">
                    <IconComponent className="h-7 w-7 text-lime-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    {event.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
