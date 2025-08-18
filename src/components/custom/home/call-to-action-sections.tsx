import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CallToActionSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
            Ready to Simplify Your Event Planning?
          </h2>
          <p className="text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Create interactive seating charts, manage guest lists, and automate
            vendor reminders with ease. Get started today and make your event
            unforgettable.
          </p>
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl px-10 py-4 font-semibold text-lg hover:scale-105"
            >
              <Link href="/get-started">Get Started Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
