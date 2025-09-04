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
import banner from "./banner.png";

export function HeroSection() {
  const benefits = [
    "✨ Setup in under 5 minutes",
    "🎯 No technical skills required",
    "📱 Mobile-friendly for guests",
    "⚡ Instant QR code generation",
  ];

  return (
    <section className="relative w-full min-h-screen py-12 md:py-20 lg:py-24 px-4 md:px-6 bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/60 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className=" w-full relative z-10 lg:px-10">
        {/* Trust Bar */}

        {/* Main Hero Content */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center w-full">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200/60 self-center lg:self-start backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700 font-semibold text-sm">
                Event Planning Made Simple
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                <span className="text-slate-900">Your</span>{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Seating Chart
                </span>
                <br />
                <span className="text-slate-900">Made</span>{" "}
                <span className="relative">
                  <span className="text-slate-900">Easy</span>
                  <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-yellow-300/60 to-orange-300/60 -rotate-1 rounded-sm"></div>
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                Create stunning seating charts in minutes. Generate QR codes for
                guests to find their seats instantly.
                <span className="font-semibold text-slate-700">
                  {" "}
                  No stress, no confusion—just perfect events.
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

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="group relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 overflow-hidden min-w-[200px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Sparkles className="h-5 w-5" />
                    Start Creating Now
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </Button>
              </Link>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Free trial • No credit card required</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 text-sm text-slate-600 justify-center lg:justify-start">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="ml-2 font-medium">
                  4.9/5 from 500+ reviews
                </span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-slate-400 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Loved by event planners worldwide</span>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced Image */}
          <div className="relative w-full">
            {/* Main Image Container */}
            <div className="relative">
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl"></div>

              {/* Image */}
              <div className="relative h-[400px] w-full lg:h-[500px] xl:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm">
                <Image
                  src={banner.src}
                  alt="Interactive Seating Chart - Create beautiful seating arrangements with drag and drop"
                  fill
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
                      Live Demo
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold text-slate-800">
                      Setup in 5 min
                    </span>
                  </div>
                </div>

                <div className="absolute top-6 right-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl px-4 py-3 shadow-lg">
                  <div className="text-xs font-semibold">✨ NEW FEATURE</div>
                  <div className="text-sm">QR Code Magic</div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-15 blur-2xl"></div>
          </div>
        </div>

        {/* Bottom Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
          {[
            { number: "1000+", label: "Events Created", icon: Users },
            { number: "50k+", label: "Happy Guests", icon: Heart },
            { number: "99.9%", label: "Uptime", icon: Shield },
            { number: "24/7", label: "Support", icon: CheckCircle },
          ].map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200/50"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <StatIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
