import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  QrCode,
  Users,
  Phone,
  Clock,
  ChevronRight,
} from "lucide-react";

export function FAQSection() {
  const faqCategories = [
    {
      title: "QR Codes & Πρόσβαση",
      icon: QrCode,
      color: "lime",
      faqs: [
        {
          question: "Αλλάζει το QR Code;",
          answer: "Όχι, παραμένει σταθερό.",
        },
        {
          question: "Λήγει;",
          answer: "Όχι, όσο η εκδήλωση είναι ενεργή.",
        },
        {
          question: "Μπορώ να κάνω αλλαγές μετά την εκτύπωση;",
          answer: "Ναι, η σελίδα ενημερώνεται αυτόματα.",
        },
      ],
    },
    {
      title: "Εμπειρία Καλεσμένων",
      icon: Users,
      color: "emerald",
      faqs: [
        {
          question: "Πώς βρίσκουν οι καλεσμένοι τη θέση τους;",
          answer:
            "Με το QR Code ή τον σύνδεσμο που τους στέλνετε η με γραπτό μήνυμα sms η WhatsApp η ακόμα και με email",
        },
      ],
    },
    {
      title: "Υποστήριξη & Τεχνική Βοήθεια",
      icon: Phone,
      color: "green",
      faqs: [
        {
          question: "Προσφέρετε υποστήριξη;",
          answer: "Ναι, με mail, live chat",
        },
      ],
    },
  ];

  const getColorConfig = (color) => {
    const configs = {
      lime: {
        bg: "bg-lime-50/60",
        border: "border-lime-200/50",
        icon: "text-lime-600",
        iconBg: "bg-lime-100",
        accent: "text-lime-600",
        hover: "hover:bg-lime-50/80",
      },
      emerald: {
        bg: "bg-emerald-50/60",
        border: "border-emerald-200/50",
        icon: "text-emerald-600",
        iconBg: "bg-emerald-100",
        accent: "text-emerald-600",
        hover: "hover:bg-emerald-50/80",
      },
      green: {
        bg: "bg-green-50/60",
        border: "border-green-200/50",
        icon: "text-green-600",
        iconBg: "bg-green-100",
        accent: "text-green-600",
        hover: "hover:bg-green-50/80",
      },
    };
    return configs[color];
  };

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-white via-slate-50/30 to-lime-50/20">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 mb-6">
            <HelpCircle className="h-4 w-4 text-lime-500" />
            <span className="text-slate-700 font-medium text-sm">
              Έχετε Ερωτήσεις;
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-lime-500 to-lime-600 bg-clip-text text-transparent">
              Συχνές Ερωτήσεις
            </span>{" "}
            <span className="text-slate-900">(FAQ)</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Βρείτε απαντήσεις σε κοινές ερωτήσεις σχετικά με την πλατφόρμα μας.
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
                      {category.faqs.length} ερωτήσεις
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
                          <p className="text-slate-700 leading-relaxed text-base">
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
        <div className="mt-16 text-center p-8 rounded-3xl bg-gradient-to-br from-lime-50/80 via-green-50/80 to-lime-50/80 backdrop-blur-sm border border-lime-200/40">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center">
              <Phone className="h-8 w-8 text-white" />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Έχετε Ακόμα Ερωτήσεις;
            </h3>

            <p className="text-lg text-slate-600 mb-6">
              Η φιλική ομάδα υποστήριξής μας είναι εδώ για να σας βοηθήσει να
              κάνετε την εμπειρία οργάνωσης εκδηλώσεών σας απρόσκοπτη και χωρίς
              άγχος.
            </p>

            <div className="flex justify-center items-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/50">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-sm font-medium text-slate-700">
                  Ζωντανή υποστήριξη σύντομα
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
