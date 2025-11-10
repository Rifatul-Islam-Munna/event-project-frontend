import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  CreditCard,
  QrCode,
  Settings,
  Users,
  Clock,
  Phone,
  Search,
  Download,
  ChevronRight,
} from "lucide-react";

export function FAQSection() {
  const faqCategories = [
    {
      title: "Pricing & Payments",
      icon: CreditCard,
      color: "orange",
      faqs: [
        {
          question: "Is it a subscription or a one-time payment?",
          answer:
            "Our platform offers flexible pricing plans, including both one-time event passes and subscription options for frequent users. Details are available on our pricing page with transparent pricing for every need.",
        },
        {
          question: "How far in advance should I purchase?",
          answer:
            "You can purchase and set up your event at any time. We recommend doing so as soon as you have your guest list and seating plan finalized to allow ample time for sharing.",
        },
      ],
    },
    {
      title: "QR Codes & Access",
      icon: QrCode,
      color: "emerald",
      faqs: [
        {
          question: "Does the QR code change?",
          answer:
            "No, once generated for your event, the QR code remains static and will always link to your event's public seating page. This ensures reliability for printed materials.",
        },
        {
          question: "Does the seating chart QR code expire?",
          answer:
            "The QR code does not expire as long as your event remains active on our platform. Your guests can access it anytime during your event period.",
        },
        {
          question: "Can you make changes even though the QR code is printed?",
          answer:
            "Yes, you can make changes to your seating chart and guest assignments at any time. The public event page will automatically update, so guests scanning the QR code will always see the latest version.",
        },
      ],
    },
    {
      title: "Guest Experience",
      icon: Users,
      color: "red",
      faqs: [
        {
          question: "How do guests find the event?",
          answer:
            "Guests can find their assigned seats by scanning the QR code or by clicking the shareable link you provide, then entering their name in the lookup search box. It's that simple!",
        },
        {
          question: "Does anyone share guest lookup?",
          answer:
            "Guest lookup is only accessible via the unique event link or QR code, which you share with your guests. We do not publicly share guest information and maintain strict privacy standards.",
        },
      ],
    },
    {
      title: "Platform Features",
      icon: Settings,
      color: "orange",
      faqs: [
        {
          question: "What other services does Digital Seating provide?",
          answer:
            "Beyond seating arrangements, we offer a comprehensive vendor reminder system via email and WhatsApp, guest list management, CSV import, event sharing tools, and real-time updates.",
        },
        {
          question: "Does this app guide?",
          answer:
            "Yes, our platform features an intuitive interface with clear instructions, tooltips, and step-by-step guidance to help you through every aspect of event creation and management.",
        },
      ],
    },
    {
      title: "Support & Technical",
      icon: Phone,
      color: "rose",
      faqs: [
        {
          question: "QR Code download not working on my phone?",
          answer:
            "Ensure your browser has permission to download files. Try using a different browser or clearing your cache. If issues persist, our support team is here to help you resolve it quickly.",
        },
        {
          question: "Do you offer customer support?",
          answer:
            "We offer dedicated customer support via email, live chat, and phone to assist you with any questions or issues. Our team is committed to ensuring your event planning success.",
        },
      ],
    },
  ];

  const getColorConfig = (color) => {
    const configs = {
      orange: {
        bg: "bg-orange-50/60",
        border: "border-orange-200/50",
        icon: "text-orange-600",
        iconBg: "bg-orange-100",
        accent: "text-orange-600",
        hover: "hover:bg-orange-50/80",
      },
      emerald: {
        bg: "bg-emerald-50/60",
        border: "border-emerald-200/50",
        icon: "text-emerald-600",
        iconBg: "bg-emerald-100",
        accent: "text-emerald-600",
        hover: "hover:bg-emerald-50/80",
      },
      red: {
        bg: "bg-red-50/60",
        border: "border-red-200/50",
        icon: "text-red-600",
        iconBg: "bg-red-100",
        accent: "text-red-600",
        hover: "hover:bg-red-50/80",
      },
      rose: {
        bg: "bg-rose-50/60",
        border: "border-rose-200/50",
        icon: "text-rose-600",
        iconBg: "bg-rose-100",
        accent: "text-rose-600",
        hover: "hover:bg-rose-50/80",
      },
    };
    return configs[color];
  };

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-white via-slate-50/30 to-orange-50/20">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 mb-6">
            <HelpCircle className="h-4 w-4 text-orange-500" />
            <span className="text-slate-700 font-medium text-sm">
              Got Questions?
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Frequently Asked
            </span>{" "}
            <span className="text-slate-900">Questions</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about our Digital Seating
            Arrangement platform. Can't find what you're looking for? Contact
            our support team.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => {
            const CategoryIcon = category.icon;
            const colorConfig = getColorConfig(category.color);

            return (
              <div key={categoryIndex} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl ${colorConfig.iconBg} flex items-center justify-center`}
                  >
                    <CategoryIcon className={`h-6 w-6 ${colorConfig.icon}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {category.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {category.faqs.length} questions
                    </p>
                  </div>
                </div>

                {/* FAQ Items */}
                <Accordion
                  type="single"
                  collapsible
                  className="w-full space-y-3"
                >
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem
                      key={`${categoryIndex}-${faqIndex}`}
                      value={`item-${categoryIndex}-${faqIndex}`}
                      className={`group border-2 ${colorConfig.border} ${colorConfig.bg} ${colorConfig.hover} backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300`}
                    >
                      <AccordionTrigger className="text-left hover:no-underline px-6 py-5 border-0 group-hover:px-7 transition-all duration-200">
                        <div className="flex items-center gap-4 w-full">
                          <div className="flex-1 min-w-0">
                            <span className="text-slate-900 font-semibold text-base leading-relaxed group-hover:text-slate-800 transition-colors duration-200">
                              {faq.question}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-all duration-200 group-data-[state=open]:rotate-90" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="pt-2 border-t border-slate-200/50">
                          <p className="text-slate-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>

        {/* Bottom Help Section */}
        <div className="mt-16 text-center p-8 rounded-3xl bg-gradient-to-br from-orange-50/80 via-red-50/80 to-orange-50/80 backdrop-blur-sm border border-orange-200/40">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Phone className="h-8 w-8 text-white" />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Still Have Questions?
            </h3>

            <p className="text-lg text-slate-600 mb-6">
              Our friendly support team is here to help you make your event
              planning experience seamless and stress-free.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/50">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">
                  Live Chat Available
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/50">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-slate-700">
                  24/7 Support
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/50">
                <Phone className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-slate-700">
                  Phone Support
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
