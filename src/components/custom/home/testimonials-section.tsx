"use client";
import { LazyMotion, domAnimation, m } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote, Heart, Users, Trophy, CheckCircle } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah L.",
      role: "Wedding Planner",
      company: "Elegant Events",
      rating: 5,
      text: "This app saved me hours of manual work! The drag-and-drop seating chart is incredibly intuitive, and my clients loved the QR code lookup. Highly recommend!",
      avatar: "/placeholder.svg?height=50&width=50",
      highlight: "Saved 10+ hours per event",
      color: "blue",
    },
    {
      name: "John D.",
      role: "Event Coordinator",
      company: "Corporate Solutions",
      rating: 5,
      text: "The vendor reminder system is a game-changer. Automated emails and WhatsApp messages ensure everyone is on the same page, reducing last-minute stress.",
      avatar: "/placeholder.svg?height=50&width=50",
      highlight: "Zero missed vendors",
      color: "emerald",
    },
    {
      name: "Emily R.",
      role: "Bride",
      company: "Dream Wedding",
      rating: 5,
      text: "Finding our seats was so easy with the QR code! It made our wedding day flow smoothly and guests appreciated the convenience.",
      avatar: "/placeholder.svg?height=50&width=50",
      highlight: "Perfect guest experience",
      color: "rose",
    },
    {
      name: "Michael B.",
      role: "Corporate Event Manager",
      company: "Tech Innovations",
      rating: 5,
      text: "A robust solution for large-scale events. The CSV import for guest lists is a lifesaver, and the responsive design works perfectly on all devices.",
      avatar: "/placeholder.svg?height=50&width=50",
      highlight: "Handles 500+ guests easily",
      color: "purple",
    },
    {
      name: "Lisa K.",
      role: "Party Planner",
      company: "Celebration Central",
      rating: 5,
      text: "My clients are always impressed with the professional seating charts. The platform makes me look like a pro and helps me win more business!",
      avatar: "/placeholder.svg?height=50&width=50",
      highlight: "More referrals & bookings",
      color: "orange",
    },
    {
      name: "David M.",
      role: "Hotel Event Manager",
      company: "Grand Resort",
      rating: 5,
      text: "We've streamlined our entire event process. From guest check-in to vendor coordination, everything runs like clockwork now.",
      avatar: "/placeholder.svg?height=50&width=50",
      highlight: "Seamless operations",
      color: "indigo",
    },
  ];

  const getColorConfig = (color) => {
    const configs = {
      blue: {
        bg: "from-blue-50/60 to-blue-100/30",
        border: "border-blue-200/50",
        accent: "text-blue-600",
        highlight: "bg-blue-100 text-blue-700",
      },
      emerald: {
        bg: "from-emerald-50/60 to-emerald-100/30",
        border: "border-emerald-200/50",
        accent: "text-emerald-600",
        highlight: "bg-emerald-100 text-emerald-700",
      },
      rose: {
        bg: "from-rose-50/60 to-rose-100/30",
        border: "border-rose-200/50",
        accent: "text-rose-600",
        highlight: "bg-rose-100 text-rose-700",
      },
      purple: {
        bg: "from-purple-50/60 to-purple-100/30",
        border: "border-purple-200/50",
        accent: "text-purple-600",
        highlight: "bg-purple-100 text-purple-700",
      },
      orange: {
        bg: "from-orange-50/60 to-orange-100/30",
        border: "border-orange-200/50",
        accent: "text-orange-600",
        highlight: "bg-orange-100 text-orange-700",
      },
      indigo: {
        bg: "from-indigo-50/60 to-indigo-100/30",
        border: "border-indigo-200/50",
        accent: "text-indigo-600",
        highlight: "bg-indigo-100 text-indigo-700",
      },
    };
    return configs[color];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-blue-200/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-indigo-200/15 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          {/* Header Section */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 mb-6">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="text-slate-700 font-medium text-sm">
                Customer Love
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              What Our{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Clients Say
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Don't just take our word for it. Hear from event organizers and
              guests who have experienced the ease and efficiency of our
              platform.
            </p>
          </m.div>

          {/* Trust Stats */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center items-center gap-8 mb-16 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/40 max-w-4xl mx-auto"
          >
            {[
              { icon: Users, number: "1000+", label: "Happy Customers" },
              { icon: Star, number: "4.9/5", label: "Average Rating" },
              { icon: Trophy, number: "500+", label: "Events Completed" },
              { icon: CheckCircle, number: "100%", label: "Satisfaction Rate" },
            ].map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <StatIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stat.number}
                    </div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </m.div>

          {/* Testimonials Grid */}
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
            className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {testimonials.map((testimonial, index) => {
              const colorConfig = getColorConfig(testimonial.color);

              return (
                <m.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3, ease: "easeOut" },
                  }}
                  className="group relative"
                >
                  <Card
                    className={`h-full bg-gradient-to-br ${colorConfig.bg} backdrop-blur-sm border ${colorConfig.border} rounded-3xl transition-all duration-500 hover:shadow-xl overflow-hidden`}
                  >
                    {/* Quote Icon */}
                    <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                      <Quote className="h-12 w-12 text-slate-600" />
                    </div>

                    <CardHeader className="relative z-10 pb-4">
                      {/* User Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-14 w-14 ring-2 ring-white/50 shadow-lg">
                          <AvatarImage
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                          />
                          <AvatarFallback
                            className={`bg-gradient-to-br ${colorConfig.bg} ${colorConfig.accent} font-bold`}
                          >
                            {testimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-slate-900 truncate">
                            {testimonial.name}
                          </CardTitle>
                          <div className="text-sm text-slate-600 font-medium">
                            {testimonial.role}
                          </div>
                          <div className="text-xs text-slate-500">
                            {testimonial.company}
                          </div>
                        </div>
                      </div>

                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < testimonial.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-200 text-slate-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium text-slate-600">
                          {testimonial.rating}.0
                        </span>
                      </div>

                      {/* Highlight Badge */}
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colorConfig.highlight}`}
                      >
                        {testimonial.highlight}
                      </div>
                    </CardHeader>

                    <CardContent className="relative z-10 pt-0">
                      {/* Testimonial Text */}
                      <p className="text-slate-700 leading-relaxed text-sm mb-6 group-hover:text-slate-800 transition-colors duration-200">
                        "{testimonial.text}"
                      </p>

                      {/* Verified Badge */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Verified Customer</span>
                      </div>
                    </CardContent>

                    {/* Hover Glow Effect */}
                    <div
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${colorConfig.bg} opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none`}
                    ></div>
                  </Card>
                </m.div>
              );
            })}
          </m.div>

          {/* Bottom CTA Section */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-sm border border-blue-200/40"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="text-indigo-600 font-semibold">
                  Join Our Success Stories
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Ready to Create Your Own Success Story?
              </h3>

              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Join thousands of event organizers who have transformed their
                planning process and delighted their guests.
              </p>

              {/* Social Proof Numbers */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">1000+</div>
                  <div className="text-sm text-slate-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">4.9★</div>
                  <div className="text-sm text-slate-600">Customer Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">500+</div>
                  <div className="text-sm text-slate-600">Events Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">24/7</div>
                  <div className="text-sm text-slate-600">Support</div>
                </div>
              </div>
            </div>
          </m.div>

          {/* Final Accent */}
          <m.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-16 mx-auto w-32 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-lg"
          />
        </div>
      </section>
    </LazyMotion>
  );
}
