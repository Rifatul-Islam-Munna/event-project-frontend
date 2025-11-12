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
      title: "Εγγραφή & Σύνδεση Χρηστών",
      description: "Ασφαλές σύστημα πιστοποίησης",
    },
    {
      icon: Calendar,
      title: "Δημιουργία Εκδήλωσης",
      description: "Όνομα, Ημερομηνία, Τοποθεσία, Ρύθμιση Λογοτύπου",
    },
    {
      icon: UserPlus,
      title: "Διαχείριση Λίστας Προσκεκλημένων",
      description: "Προσθήκη/Εισαγωγή μέσω CSV",
    },
    {
      icon: Layout,
      title: "Διαδραστικός Δημιουργός Διαγράμματος Καθισμάτων",
      description: "Σύρε & Άφησε τραπέζια και θέσεις",
    },
    {
      icon: MapPin,
      title: "Έξυπνη Ανάθεση Καλεσμένων",
      description: "Ανάθεση καλεσμένων σε θέσεις με αναζήτηση",
    },
    {
      icon: Share2,
      title: "Σελίδα Εκδήλωσης για Κοινή Χρήση",
      description: "Δημιουργία Συνδέσμου & QR Code",
    },
  ];

  const vendorFeatures = [
    {
      icon: FileText,
      title: "Δημιουργία Φόρμας Προμηθευτή",
      description: "Όνομα, Email, WhatsApp, Προσαρμοσμένα πεδία",
    },
    {
      icon: Mail,
      title: "Αυτόματες Υπενθυμίσεις Email",
      description: "Προγραμματισμένες ειδοποιήσεις email",
    },
    {
      icon: MessageCircle,
      title: "Ενσωμάτωση WhatsApp",
      description: "Μηνύματα μέσω API",
    },
    {
      icon: Settings,
      title: "Πίνακας Ελέγχου Πελάτη",
      description: "Προβολή/Επεξεργασία/Διαγραφή υπενθυμίσεων",
    },
    {
      icon: Clock,
      title: "Αυτοματοποιημένος Προγραμματισμός",
      description: "Cron job για αποστολή",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-slate-50 via-lime-50/30 to-lime-50/50">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-lime-500 to-lime-600 bg-clip-text text-transparent mb-4">
            Βασικά Χαρακτηριστικά
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-slate-600 leading-relaxed">
            Η πλατφόρμα μας προσφέρει ολοκληρωμένα εργαλεία για διοργανωτές
            εκδηλώσεων, ώστε να διαχειρίζονται την θέση των καλεσμένων και να
            επικοινωνούν με τους προμηθευτές εύκολα
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
            <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-white to-lime-50/50 border-2 border-lime-100/60 hover:border-lime-200/80 transition-all duration-300">
              {/* Card Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    Σύστημα Τοποθέτησης Καθισμάτων
                  </h3>
                  <p className="text-sm text-lime-600 font-medium">
                    Ολοκληρωμένη Διαχείριση Εκδηλώσεων
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
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-lime-50/50 transition-colors duration-200 group/item"
                    >
                      <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center flex-shrink-0 group-hover/item:bg-lime-200 transition-colors">
                        <IconComponent className="h-5 w-5 text-lime-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 mb-1 group-hover/item:text-lime-700 transition-colors">
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
            <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-white to-green-50/50 border-2 border-green-100/60 hover:border-green-200/80 transition-all duration-300">
              {/* Card Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-lime-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    Πλατφόρμα Υπενθυμίσεων Προμηθευτών
                  </h3>
                  <p className="text-sm text-green-600 font-medium">
                    Έξυπνη Πλατφόρμα Επικοινωνίας
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
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-green-50/50 transition-colors duration-200 group/item"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 group-hover/item:bg-green-200 transition-colors">
                        <IconComponent className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 mb-1 group-hover/item:text-green-700 transition-colors">
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
