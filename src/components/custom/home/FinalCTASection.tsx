"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, CheckCircle, ArrowRight } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="w-full py-16 md:py-20 lg:py-24 bg-gradient-to-br from-lime-500 via-lime-600 to-green-600 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 mb-8">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="text-white font-bold text-sm md:text-base">
              Ξεκινήστε τώρα
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            Κάντε την επόμενη εκδήλωσή σας
            <br />
            αξέχαστη!
          </h2>

          {/* Benefits List */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 text-white">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Χωρίς πιστωτική κάρτα</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/50 rounded-full"></div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">ΔΩΡΕΑΝ δοκιμή</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/50 rounded-full"></div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Άμεση ακύρωση όποτε θέλετε</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link href="/dashboard">
            <Button
              size="lg"
              className="group bg-white text-lime-600 hover:bg-lime-50 font-bold text-xl px-10 py-7 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 mb-8"
            >
              <span className="flex items-center gap-3">
                Ξεκινήστε Δωρεάν
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>

          {/* Final Message */}
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto">
            Γίνετε μέρος των επιτυχημένων ιστοριών μας και κάντε κάθε εκδήλωση
            αξέχαστη!
          </p>
        </motion.div>
      </div>
    </section>
  );
}
