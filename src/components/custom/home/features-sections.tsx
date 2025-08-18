import { CheckCircle } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Key Features
            </h2>
            <p className="max-w-[900px] text-slate-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform offers comprehensive tools for event organizers to
              manage seating and communicate with vendors effortlessly.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl items-start gap-6 py-12 md:grid-cols-2 lg:gap-8">
          <div className="space-y-6 p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-xs hover:bg-white/80  transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Seating Arrangement System
              </h3>
            </div>
            <div className="grid gap-4 text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">
                    User Registration & Login
                  </p>
                  <p className="text-sm text-slate-600">
                    Secure authentication system
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">Event Creation</p>
                  <p className="text-sm text-slate-600">
                    Name, Date, Location, Logo setup
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">
                    Guest List Management
                  </p>
                  <p className="text-sm text-slate-600">Add/Import via CSV</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">
                    Interactive Seating Chart Builder
                  </p>
                  <p className="text-sm text-slate-600">
                    Drag & Drop tables & seats
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">
                    Smart Guest Assignment
                  </p>
                  <p className="text-sm text-slate-600">
                    Assign guests to seats with lookup
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">
                    Shareable Event Page
                  </p>
                  <p className="text-sm text-slate-600">
                    Link & QR Code generation
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-xs hover:bg-white/80  transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Vendor Reminder System
              </h3>
            </div>
            <div className="grid gap-4 text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">
                    Vendor Form Creation
                  </p>
                  <p className="text-sm text-slate-600">
                    Name, Email, WhatsApp, Custom fields
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">
                    Auto Email Reminders
                  </p>
                  <p className="text-sm text-slate-600">
                    Scheduled email notifications
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">
                    WhatsApp Integration
                  </p>
                  <p className="text-sm text-slate-600">
                    API-powered messaging
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">Client Dashboard</p>
                  <p className="text-sm text-slate-600">
                    View/Edit/Delete reminders
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">
                    Automated Scheduling
                  </p>
                  <p className="text-sm text-slate-600">
                    Cron job for delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
