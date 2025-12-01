"use client";
import { motion } from "framer-motion";
import { Shield, Bell, MessageCircle, HeadphonesIcon } from "lucide-react";

export function ReliabilitySupportSection() {
  return (
    <section className="w-full py-16 md:py-20 lg:py-24 bg-gradient-to-br from-slate-50/50 via-green-50/30 to-lime-50/40 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Organic Curved Shape Background */}
          <div className="relative bg-gradient-to-br from-green-50 to-lime-100/50 rounded-[3rem] md:rounded-[4rem] border-4 border-green-500/40 p-8 md:p-12 lg:p-16  overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-green-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              {/* Icon Header */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center ">
                  <Shield className="h-10 w-10 text-white" />
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-center text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Πλήρης αξιοπιστία και υποστήριξη
              </h2>

              {/* Content in Cards */}
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Automated Notifications */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-300/60 ">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <Bell className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Αυτοματοποιημένες ειδοποιήσεις
                    </h3>
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    διασφαλίζουν ότι προμηθευτές και συνεργάτες είναι πάντα στην
                    ώρα τους.
                  </p>
                </div>

                {/* Support Team */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-300/60 ">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <HeadphonesIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      24/7 Υποστήριξη
                    </h3>
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    Η ομάδα υποστήριξής μας είναι δίπλα σας σε κάθε βήμα, με
                    email η live chat
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
