"use client";
import { motion } from "framer-motion";
import { Shield, Bell, HeadphonesIcon } from "lucide-react";

export function ReliabilitySupportSection() {
  return (
    <section className="w-full py-12  lg:py-14 bg-gradient-to-br from-slate-50/50 via-green-50/30 to-lime-50/40">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8"
        >
          {/* Icon */}
          <div className="inline-flex w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-600 items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
              Πλήρης{" "}
              <span className="bg-gradient-to-r from-green-500 via-green-600 to-green-600 bg-clip-text text-transparent">
                αξιοπιστία
              </span>{" "}
              και υποστήριξη
            </h2>
            <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
              Είμαστε δίπλα σας σε κάθε βήμα της διοργάνωσής σας
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
            {/* Automated Notifications */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-green-300 hover:shadow-md transition-all duration-300 text-left">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Αυτοματοποιημένες ειδοποιήσεις
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Διασφαλίζουν ότι προμηθευτές και συνεργάτες είναι πάντα στην
                    ώρα τους
                  </p>
                </div>
              </div>
            </div>

            {/* 24/7 Support */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-green-300 hover:shadow-md transition-all duration-300 text-left">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <HeadphonesIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    24/7 Υποστήριξη
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Η ομάδα υποστήριξής μας είναι δίπλα σας σε κάθε βήμα, με
                    email ή live chat
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
