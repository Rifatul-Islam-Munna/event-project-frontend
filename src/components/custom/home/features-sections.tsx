"use client";
import {
  CheckCircle,
  Users,
  Calendar,
  UserPlus,
  Layout,
  MapPin,
  Share2,
  FileText,
  Mail,
  MessageCircle,
  Settings,
  Clock,
  Shield,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const seatingFeatures = [
    {
      icon: Users,
      title: "User Registration & Login",
      description: "Secure authentication system",
    },
    {
      icon: Calendar,
      title: "Event Creation",
      description: "Name, Date, Location, Logo setup",
    },
    {
      icon: UserPlus,
      title: "Guest List Management",
      description: "Add/Import via CSV",
    },
    {
      icon: Layout,
      title: "Interactive Seating Chart Builder",
      description: "Drag & Drop tables & seats",
    },
    {
      icon: MapPin,
      title: "Smart Guest Assignment",
      description: "Assign guests to seats with lookup",
    },
    {
      icon: Share2,
      title: "Shareable Event Page",
      description: "Link & QR Code generation",
    },
  ];

  const vendorFeatures = [
    {
      icon: FileText,
      title: "Vendor Form Creation",
      description: "Name, Email, WhatsApp, Custom fields",
    },
    {
      icon: Mail,
      title: "Auto Email Reminders",
      description: "Scheduled email notifications",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Integration",
      description: "API-powered messaging",
    },
    {
      icon: Settings,
      title: "Client Dashboard",
      description: "View/Edit/Delete reminders",
    },
    {
      icon: Clock,
      title: "Automated Scheduling",
      description: "Cron job for delivery",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/50">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-4">
            Key Features
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-slate-600 leading-relaxed">
            Our platform offers comprehensive tools for event organizers to
            manage seating and communicate with vendors effortlessly.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto"
        >
          {/* Seating Arrangement System */}
          <motion.div variants={cardVariants} className="group relative">
            <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-white to-orange-50/50 border-2 border-orange-100/60 hover:border-orange-200/80 transition-all duration-300">
              {/* Card Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    Seating Arrangement System
                  </h3>
                  <p className="text-sm text-orange-600 font-medium">
                    Complete Event Management
                  </p>
                </div>
              </div>

              {/* Features List */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.2,
                    },
                  },
                }}
                className="space-y-4"
              >
                {seatingFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={featureVariants}
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-orange-50/50 transition-colors duration-200 group/item"
                    >
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover/item:bg-orange-200 transition-colors">
                        <IconComponent className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 mb-1 group-hover/item:text-orange-700 transition-colors">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>

          {/* Vendor Reminder System */}
          <motion.div variants={cardVariants} className="group relative">
            <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-white to-red-50/50 border-2 border-red-100/60 hover:border-red-200/80 transition-all duration-300">
              {/* Card Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    Vendor Reminder System
                  </h3>
                  <p className="text-sm text-red-600 font-medium">
                    Smart Communication Hub
                  </p>
                </div>
              </div>

              {/* Features List */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.2,
                    },
                  },
                }}
                className="space-y-4"
              >
                {vendorFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={featureVariants}
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-red-50/50 transition-colors duration-200 group/item"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 group-hover/item:bg-red-200 transition-colors">
                        <IconComponent className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 mb-1 group-hover/item:text-red-700 transition-colors">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
