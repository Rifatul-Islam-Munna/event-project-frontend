"use client";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function ValuePropositionSection() {
  return (
    <section className="w-full py-16 md:py-20 lg:py-24 bg-gradient-to-br from-lime-50/30 via-white to-slate-50/50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Organic Curved Shape Background */}
          <div className="relative bg-gradient-to-br from-lime-50 to-lime-100/50 rounded-[3rem] md:rounded-[4rem] border-4 border-lime-500/40 p-8 md:p-12 lg:p-16  overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl"></div>

            {/* Badge */}
            <div className="relative z-10 flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-lime-500/20 border-2 border-lime-500/40">
                <Sparkles className="h-5 w-5 text-lime-600" />
                <span className="text-lime-700 font-bold text-sm md:text-base">
                  Εντάξει σε 1000+ Συχνερισμένους Διοργανωτές Εκδηλώσεων
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h2 className="relative z-10 text-center text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Έτοιμοι να Μεταμορφώσετε τις Εκδηλώσεις σας;
            </h2>

            {/* Description */}
            <p className="relative z-10 text-center text-lg md:text-xl lg:text-2xl text-slate-700 leading-relaxed max-w-4xl mx-auto mb-8">
              Σταματήστε να ανησυχείτε το άγχος της οργάνωσης εκδηλώσεων να
              καταλλάβει τον χρόνο σας. Αρχίζτε να δημιουργείτε αξέχαστες
              εμπειρίες με αυτοπεποίθηση και ευκολία.
            </p>

            {/* Value Statement in Box */}
            <div className="relative z-10 max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border-2 border-lime-300/60 ">
              <p className="text-center text-xl md:text-2xl lg:text-3xl font-semibold text-slate-800 leading-relaxed">
                να επικεντρωθείτε σε αυτό που έχει σημασία: τη δημιουργία
                αξέχαστων στιγμών.
              </p>

              <div className="mt-6 pt-6 border-t-2 border-lime-200">
                <p className="text-center text-2xl md:text-3xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
                  Μηδενικό άγχος + Άπειρη δημιουργία = Μαγικό αποτέλεσμα!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
