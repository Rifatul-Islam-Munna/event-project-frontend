"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, CheckCircle, ArrowRight } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="w-full py-16 md:py-18 lg:py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white border border-slate-200 rounded-3xl px-6 py-10 md:px-10 md:py-12 "
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-6">
            <Sparkles className="h-4 w-4 text-lime-600" />
            <span className="text-slate-800 font-semibold text-xs md:text-sm">
              Ξεκινήστε τώρα
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 leading-tight">
            Κάντε την επόμενη εκδήλωσή σας
            <br />
            αξέχαστη!
          </h2>

          {/* Benefits List */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 text-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-lime-600" />
              <span className="font-semibold text-sm md:text-base">
                Χωρίς πιστωτική κάρτα
              </span>
            </div>
            <span className="hidden sm:block text-slate-300">•</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-lime-600" />
              <span className="font-semibold text-sm md:text-base">
                ΔΩΡΕΑΝ δοκιμή
              </span>
            </div>
            <span className="hidden sm:block text-slate-300">•</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-lime-600" />
              <span className="font-semibold text-sm md:text-base">
                Άμεση ακύρωση όποτε θέλετε
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <Link href="/dashboard">
            <Button
              size="lg"
              className="group bg-lime-600 text-white hover:bg-lime-700 font-bold text-lg md:text-xl px-8 md:px-10 py-5 md:py-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 mb-6"
            >
              <span className="flex items-center gap-3">
                Ξεκινήστε Δωρεάν
                <ArrowRight className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>

          {/* Final Message */}
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-3xl mx-auto">
            Γίνετε μέρος των επιτυχημένων ιστοριών μας και κάντε κάθε εκδήλωση
            αξέχαστη!
          </p>
        </motion.div>
      </div>
    </section>
  );
}
