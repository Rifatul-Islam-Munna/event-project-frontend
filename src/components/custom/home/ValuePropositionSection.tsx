"use client";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";

export function ValuePropositionSection() {
  return (
    <section className="w-full py-12 m lg:py-14 bg-gradient-to-br from-lime-50/30 via-white to-slate-50/50">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 border border-lime-500/30">
            <TrendingUp className="h-4 w-4 text-lime-600" />
            <span className="text-lime-700 font-semibold text-sm">
              Εμπιστεύονται 1000+ Διοργανωτές Εκδηλώσεων
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            Έτοιμοι να Μεταμορφώσετε τις{" "}
            <span className="bg-gradient-to-r from-lime-500 via-lime-600 to-lime-600 bg-clip-text text-transparent">
              Εκδηλώσεις σας;
            </span>
          </h2>

          {/* Combined Description */}
          <p className="text-base md:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Σταματήστε να ανησυχείτε το άγχος της οργάνωσης εκδηλώσεων να
            καταλλάβει τον χρόνο σας. Αρχίστε να δημιουργείτε αξέχαστες
            εμπειρίες με αυτοπεποίθηση και ευκολία — να επικεντρωθείτε σε αυτό
            που έχει σημασία: τη δημιουργία αξέχαστων στιγμών.
          </p>

          {/* Simple Value Statement */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="bg-gradient-to-r from-lime-500/10 via-lime-600/10 to-lime-500/10 rounded-2xl px-6 py-5 border border-lime-300/40">
              <p className="text-lg md:text-xl font-semibold text-slate-800">
                Μηδενικό άγχος + Άπειρη δημιουργία = Μαγικό αποτέλεσμα!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
