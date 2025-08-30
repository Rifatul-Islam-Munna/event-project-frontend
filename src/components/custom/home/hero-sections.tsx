import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import banner from "./banner.png";

export function HeroSection() {
  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 md:px-6 grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
        <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl xl:text-7xl max-w-4xl mx-auto lg:mx-0 leading-tight text-slate-900">
              Your Seating Chart Made Easy
            </h1>
            <p className="max-w-[600px] text-slate-600 md:text-xl mx-auto lg:mx-0">
              Simply create an event to manage your guest list, and print your
              QR Code for guests to search and find their seat.
            </p>
          </div>
          {/* <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-600 transition-all duration-300 rounded-2xl px-8 py-3 font-semibold shadow-sm  transform "
            >
              <Link href="/get-started">Get Started</Link>
            </Button>
          </div> */}
        </div>
        <div className="relative h-[300px] w-full lg:h-[400px] xl:h-[500px] rounded-2xl overflow-hidden ">
          <Image
            src={banner.src}
            alt="Interactive Seating Chart"
            fill
            className="object-cover rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
}
