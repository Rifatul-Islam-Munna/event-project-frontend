import { ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="max-w-[900px] text-slate-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our intuitive platform makes managing your event seating and
              vendor communications simple.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-6xl py-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center flex-1 min-w-0 space-y-6 hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900">
                Create Your Event
              </h3>
              <p className="text-slate-600 max-w-xs">
                Set up your event with essential details like name, date,
                location, and logo.
              </p>
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="hidden lg:block">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-slate-100 to-blue-50 flex items-center justify-center">
              <ArrowRight
                className="h-6 w-6 text-blue-400"
                aria-hidden="true"
              />
            </div>
            <span className="sr-only">Next step</span>
          </div>
          <div className="block lg:hidden">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-slate-100 to-blue-50 flex items-center justify-center">
              <ArrowRight
                className="h-6 w-6 text-blue-400 rotate-90"
                aria-hidden="true"
              />
            </div>
            <span className="sr-only">Next step</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center flex-1 min-w-0 space-y-6 hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900">
                Manage Guests & Seating
              </h3>
              <p className="text-slate-600 max-w-xs">
                Import guest lists, design interactive seating charts with
                drag-and-drop, and assign seats.
              </p>
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="hidden lg:block">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-slate-100 to-blue-50 flex items-center justify-center">
              <ArrowRight
                className="h-6 w-6 text-blue-400"
                aria-hidden="true"
              />
            </div>
            <span className="sr-only">Next step</span>
          </div>
          <div className="block lg:hidden">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-slate-100 to-blue-50 flex items-center justify-center">
              <ArrowRight
                className="h-6 w-6 text-blue-400 rotate-90"
                aria-hidden="true"
              />
            </div>
            <span className="sr-only">Next step</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center flex-1 min-w-0 space-y-6 hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900">
                Share with Guests
              </h3>
              <p className="text-slate-600 max-w-xs">
                Generate shareable links and QR codes for guests to easily find
                their seats.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
