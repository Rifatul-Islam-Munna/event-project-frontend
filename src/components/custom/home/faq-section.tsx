import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      question: "Is it a subscription or a one-time payment?",
      answer:
        "Our platform offers flexible pricing plans, including both one-time event passes and subscription options for frequent users. Details are available on our pricing page (not included in this demo).",
    },
    {
      question: "Does the QR code change?",
      answer:
        "No, once generated for your event, the QR code remains static and will always link to your event's public seating page.",
    },
    {
      question: "Does the seating chart QR code expire?",
      answer:
        "The QR code does not expire as long as your event remains active on our platform.",
    },
    {
      question: "What other services does Digital Seating provide?",
      answer:
        "Beyond seating arrangements, we offer a comprehensive vendor reminder system via email and WhatsApp, guest list management, and event sharing tools.",
    },
    {
      question: "Does anyone share guest lookup?",
      answer:
        "Guest lookup is only accessible via the unique event link or QR code, which you share with your guests. We do not publicly share guest information.",
    },
    {
      question: "Can you make changes even though the QR code is printed?",
      answer:
        "Yes, you can make changes to your seating chart and guest assignments at any time. The public event page will automatically update, so guests scanning the QR code will always see the latest version.",
    },
    {
      question: "How far in advance should I purchase?",
      answer:
        "You can purchase and set up your event at any time. We recommend doing so as soon as you have your guest list and seating plan finalized to allow ample time for sharing.",
    },
    {
      question: "How do guests find the event?",
      answer:
        "Guests can find their assigned seats by scanning the QR code or by clicking the shareable link you provide, then entering their name in the lookup search box.",
    },
    {
      question: "Does this app guide?",
      answer:
        "Yes, our platform features an intuitive interface with clear instructions and tooltips to guide you through every step of event creation and management.",
    },
    {
      question: "QR Code download not working on my phone?",
      answer:
        "Ensure your browser has permission to download files. If issues persist, try a different browser or contact support.",
    },
    {
      question: "Do you offer customer support?",
      answer:
        "We offer dedicated customer support to assist you with any questions or issues you may encounter.",
    },
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white via-blue-50/20 to-indigo-50/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="max-w-[900px] text-slate-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Find answers to common questions about our Digital Seating
              Arrangement Web App.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl py-12">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="group border-0 bg-white/60 backdrop-blur-md rounded-2xl px-6 py-2 hover:bg-white/80 transition-all duration-300"
              >
                <AccordionTrigger className="text-left text-slate-900 hover:text-blue-600 font-medium py-6 border-0">
                  <span className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed pb-6 pl-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
