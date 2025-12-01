import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Clock,
  Heart,
} from "lucide-react";
import banner from "./banner.jpeg";

export function HeroSection() {
  const benefits = [
    "✨ Δημιουργία QR Code σε λιγότερο από 2 λεπτά",
    "🎯 Δεν απαιτούνται τεχνικές γνώσεις",
    "📱 Συμβατό με όλες τις συσκευές",
    "⚡ Το απόλυτο εργαλείο για εύκολη διοργάνωση",
  ];

  return (
    <section className="relative w-full min-h-screen py-12 md:py-20 lg:py-24 px-4 md:px-6 bg-gradient-to-br from-slate-50 via-lime-50/80 to-lime-100/60 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-lime-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-lime-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-lime-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className=" w-full relative z-10 lg:px-10">
        {/* Main Hero Content */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center w-full">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-lime-100 to-lime-100 border border-lime-200/60 self-center lg:self-start backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-lime-600" />
              <span className="text-lime-700 font-semibold text-sm">
                Η οργάνωση εκδηλώσεων έγινε απλή υπόθεση!
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                <span className="text-slate-900">Το πλάνο θέσεων</span>{" "}
                <span className="bg-gradient-to-r from-lime-500 via-lime-600 to-lime-600 bg-clip-text text-transparent">
                  των καλεσμένων σας
                </span>
                <br />
                <span className="text-slate-900">
                  που κάποτε έμοιαζε με γρίφο, τώρα
                </span>{" "}
                <span className="relative">
                  <span className="text-slate-900">δημιουργείται εύκολα</span>
                  <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-lime-300/60 to-lime-300/60 -rotate-1 rounded-sm"></div>
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                Δημιουργείται μέσα σε λίγα λεπτά. Οι καλεσμένοι βρίσκουν μόνοι
                τους τη θέση τους με ένα QR Code
                <span className="font-semibold text-slate-700">
                  {" "}
                  — και το άγχος της προετοιμασίας εξαφανίζεται!
                </span>
              </p>
            </div>

            {/* Benefits List */}
            <div className="grid grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* New Section - What the Platform Offers */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-lime-200/40">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Τι προσφέρει η πλατφόρμα
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ένα ολοκληρωμένο εργαλείο για διοργανωτές εκδηλώσεων που θέλουν
                να διαχειρίζονται θέσεις, καλεσμένους και προμηθευτές εύκολα και
                γρήγορα.
              </p>
            </div>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="group relative bg-gradient-to-r from-lime-500 via-lime-600 to-lime-600 text-white font-bold text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 overflow-hidden min-w-[200px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Sparkles className="h-5 w-5" />
                    Ξεκινήστε Τώρα
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </Button>
              </Link>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Δωρεάν δοκιμή • Χωρίς πιστωτική κάρτα</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 text-sm text-slate-600 justify-center lg:justify-start">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-lime-400 text-lime-400"
                    />
                  ))}
                </div>
                <span className="ml-2 font-medium">
                  4.9/5 από 500+ αξιολογήσεις
                </span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-slate-400 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Αγαπημένο από διοργανωτές παγκοσμίως</span>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced Image */}
          <div className="relative w-full">
            {/* Main Image Container */}
            <div className="relative">
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-lime-500/20 to-lime-500/20 rounded-3xl blur-2xl"></div>

              {/* Image */}
              <div className="relative h-[400px] w-full lg:h-[500px] xl:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm">
                <Image
                  src={banner.src}
                  alt="Interactive Seating Chart - Create beautiful seating arrangements with drag and drop"
                  width={3000}
                  height={3000}
                  className="object-cover"
                  priority
                />

                {/* Image Overlay with Stats */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                {/* Floating Success Badges */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-slate-800">
                      Ζωντανή Επίδειξη
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-lime-500" />
                    <span className="text-sm font-semibold text-slate-800">
                      Ρύθμιση σε 2 λεπτά
                    </span>
                  </div>
                </div>

                <div className="absolute top-6 right-6 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-2xl px-4 py-3 shadow-lg">
                  <div className="text-xs font-semibold">✨ ΝΕΟ</div>
                  <div className="text-sm">QR Code</div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-lime-400 to-lime-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-lime-400 to-lime-500 rounded-full opacity-15 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
