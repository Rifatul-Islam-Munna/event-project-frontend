import {
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  Scale,
  Lock,
  RefreshCw,
  Ban,
  UserCheck,
  CreditCard,
  Globe,
  Mail,
} from "lucide-react";

export default function TermsAndConditions() {
  const termsData = [
    {
      icon: UserCheck,
      title: "Account Registration",
      items: [
        "You must be at least 18 years old to create an account",
        "Provide accurate, current, and complete information during registration",
        "Maintain the security of your password and account credentials",
        "You are responsible for all activities that occur under your account",
        "Notify us immediately of any unauthorized use of your account",
      ],
    },
    {
      icon: CreditCard,
      title: "Payment & Billing",
      items: [
        "All prices are listed in the currency specified at checkout",
        "Payment is required before accessing premium features",
        "Subscription fees are billed in advance on a recurring basis",
        "We accept major credit cards and other payment methods as indicated",
        "Failure to pay may result in suspension or termination of services",
        "All sales are final unless otherwise stated in our refund policy",
      ],
    },
    {
      icon: Shield,
      title: "Privacy & Data Protection",
      items: [
        "We collect and process your data as outlined in our Privacy Policy",
        "Your personal information is stored securely and protected",
        "We do not sell or share your data with third parties without consent",
        "You have the right to access, modify, or delete your personal data",
        "We use cookies and similar technologies to enhance user experience",
      ],
    },
    {
      icon: FileText,
      title: "Service Usage",
      items: [
        "Our platform is provided for event planning and seating management",
        "You may not use the service for any illegal or unauthorized purpose",
        "Content uploaded must not violate any laws or third-party rights",
        "We reserve the right to modify or discontinue services at any time",
        "Service availability is not guaranteed and may experience downtime",
        "You must comply with all applicable local, state, and federal laws",
      ],
    },
    {
      icon: Lock,
      title: "Intellectual Property",
      items: [
        "All content, features, and functionality are owned by us",
        "Trademarks, logos, and service marks are our exclusive property",
        "You may not copy, modify, or distribute our content without permission",
        "User-generated content remains your property, but you grant us a license to use it",
        "We respect intellectual property rights and expect users to do the same",
      ],
    },
    {
      icon: RefreshCw,
      title: "Refunds & Cancellations",
      items: [
        "Refund requests must be submitted within 30 days of purchase",
        "Eligible refunds will be processed within 5-10 business days",
        "Subscription cancellations take effect at the end of the billing period",
        "No refunds for partial use of subscription periods",
        "Event-specific purchases are non-refundable after the event date",
      ],
    },
    {
      icon: Ban,
      title: "Prohibited Activities",
      items: [
        "Attempting to gain unauthorized access to our systems or networks",
        "Uploading malicious code, viruses, or harmful software",
        "Harassing, abusing, or harming other users of the platform",
        "Engaging in fraudulent activities or impersonating others",
        "Scraping, data mining, or automated data collection without permission",
        "Violating any applicable laws or regulations",
      ],
    },
    {
      icon: AlertCircle,
      title: "Limitation of Liability",
      items: [
        "We are not liable for any indirect, incidental, or consequential damages",
        "Service is provided 'as is' without warranties of any kind",
        "We do not guarantee error-free or uninterrupted service",
        "Total liability shall not exceed the amount paid for services",
        "Some jurisdictions do not allow liability limitations",
      ],
    },
    {
      icon: Scale,
      title: "Dispute Resolution",
      items: [
        "Any disputes shall be resolved through binding arbitration",
        "Arbitration will be conducted in accordance with applicable rules",
        "You waive the right to participate in class action lawsuits",
        "Informal dispute resolution must be attempted before arbitration",
        "Governing law shall be the laws of [Your Jurisdiction]",
      ],
    },
    {
      icon: RefreshCw,
      title: "Changes to Terms",
      items: [
        "We reserve the right to modify these terms at any time",
        "Changes will be effective immediately upon posting to the website",
        "Continued use of the service constitutes acceptance of new terms",
        "We will notify users of material changes via email or platform notice",
        "It is your responsibility to review terms periodically",
      ],
    },
    {
      icon: Mail,
      title: "Contact Information",
      items: [
        "For questions about these terms, contact us via email or support portal",
        "We will respond to inquiries within 2-3 business days",
        "Legal notices should be sent to our registered business address",
        "Customer support is available through multiple channels",
        "Feedback and suggestions are always welcome",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/30 to-orange-50/20">
      {/* Header Section */}
      <div className="w-full py-16 md:py-20 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FileText className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Please read these terms carefully before using our services
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 text-white/80 text-sm">
            <span>Last Updated: November 10, 2025</span>
            <div className="w-1 h-1 bg-white/60 rounded-full"></div>
            <span>Effective Date: November 10, 2025</span>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl py-12">
        <div className="bg-orange-50/60 border-2 border-orange-200/50 rounded-2xl p-6 md:p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Important Notice
              </h2>
              <p className="text-slate-700 leading-relaxed">
                By accessing or using our Digital Seating Arrangement platform,
                you agree to be bound by these Terms and Conditions. If you do
                not agree with any part of these terms, you must not use our
                services. These terms constitute a legally binding agreement
                between you and our company.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8">
          {termsData.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div
                key={index}
                className="bg-white border-2 border-slate-200/60 rounded-2xl p-6 md:p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                      {index + 1}. {section.title}
                    </h3>
                  </div>
                </div>

                <ul className="space-y-3 ml-16">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-slate-700 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Acceptance Footer */}
        <div className="mt-12 bg-gradient-to-br from-orange-50/80 via-red-50/80 to-orange-50/80 border-2 border-orange-200/40 rounded-2xl p-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Agreement & Acceptance
            </h3>
            <p className="text-slate-700 leading-relaxed mb-6">
              By clicking "I Accept" or by continuing to use our services, you
              acknowledge that you have read, understood, and agree to be bound
              by these Terms and Conditions. If you have any questions or
              concerns, please contact our support team before proceeding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-slate-700">
                  Legally Binding Agreement
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/50">
                <Globe className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-slate-700">
                  Applicable Worldwide
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 text-center p-6 rounded-2xl bg-slate-50 border border-slate-200/50">
          <p className="text-slate-600 text-sm">
            Questions about these terms?{" "}
            <a
              href="/contact"
              className="text-orange-600 hover:text-orange-700 font-semibold underline"
            >
              Contact our legal team
            </a>{" "}
            or email us at{" "}
            <a
              href="mailto:legal@example.com"
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              legal@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
