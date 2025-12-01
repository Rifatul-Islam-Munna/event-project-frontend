"use client";
import { motion } from "framer-motion";
import { PartyPopper, Users2, Cake, Heart } from "lucide-react";

export function EventTypesSection() {
  return (
    <section className="w-full py-16 md:py-20 lg:py-24 bg-gradient-to-br from-lime-50/30 via-white to-slate-50/50">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <PartyPopper className="h-12 w-12 text-lime-600" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
              Για κάθε είδους εκδήλωση
            </h2>
          </div>

          <div className="max-w-3xl mx-auto bg-gradient-to-br from-white to-lime-50/50 rounded-2xl p-8 border-2 border-lime-200/60 ">
            <p className="text-xl md:text-2xl text-slate-700 leading-relaxed mb-6">
              Από μικρές, ιδιωτικές συγκεντρώσεις μέχρι μεγάλες γιορτές — η
              πλατφόρμα προσαρμόζεται σε κάθε ανάγκη, χωρίς περιορισμούς.
            </p>

            {/* Event Icons */}
            <div className="flex justify-center gap-6 flex-wrap">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-lime-100 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-lime-600" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Γάμοι</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-lime-100 flex items-center justify-center">
                  <Cake className="h-8 w-8 text-lime-600" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Πάρτι</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-lime-100 flex items-center justify-center">
                  <Users2 className="h-8 w-8 text-lime-600" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Συνέδρια</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-lime-100 flex items-center justify-center">
                  <PartyPopper className="h-8 w-8 text-lime-600" />
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  Εκδηλώσεις
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
