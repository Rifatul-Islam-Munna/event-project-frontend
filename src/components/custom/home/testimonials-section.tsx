import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah L.",
      role: "Wedding Planner",
      rating: 5,
      text: "This app saved me hours of manual work! The drag-and-drop seating chart is incredibly intuitive, and my clients loved the QR code lookup. Highly recommend!",
      avatar: "/placeholder.svg?height=50&width=50",
    },
    {
      name: "John D.",
      role: "Event Coordinator",
      rating: 5,
      text: "The vendor reminder system is a game-changer. Automated emails and WhatsApp messages ensure everyone is on the same page, reducing last-minute stress.",
      avatar: "/placeholder.svg?height=50&width=50",
    },
    {
      name: "Emily R.",
      role: "Bride",
      rating: 5,
      text: "Finding our seats was so easy with the QR code! It made our wedding day flow smoothly and guests appreciated the convenience.",
      avatar: "/placeholder.svg?height=50&width=50",
    },
    {
      name: "Michael B.",
      role: "Corporate Event Manager",
      rating: 4,
      text: "A robust solution for large-scale events. The CSV import for guest lists is a lifesaver, and the responsive design works perfectly on all devices.",
      avatar: "/placeholder.svg?height=50&width=50",
    },
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              What Our Clients Say
            </h2>
            <p className="max-w-[900px] text-slate-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from event organizers and guests who have experienced the
              ease and efficiency of our platform.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group relative flex flex-col h-full bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl hover:bg-white/80 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="relative z-10 flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-12 w-12 ring-2 ring-blue-100/50">
                  <AvatarImage
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <CardTitle className="text-lg text-slate-900">
                    {testimonial.name}
                  </CardTitle>
                  <div className="text-sm text-slate-500">
                    {testimonial.role}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 flex-1 flex flex-col justify-between">
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 stroke-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {testimonial.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
