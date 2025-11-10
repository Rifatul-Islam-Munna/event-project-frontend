import {
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Globe,
  Cookie,
  Mail,
  FileCheck,
  AlertCircle,
  CheckCircle,
  Download,
  Trash2,
  Share2,
  Bell,
} from "lucide-react";

export default function PrivacyPolicy() {
  const privacyData = [
    {
      icon: Database,
      title: "Information We Collect",
      items: [
        "Personal identification information (name, email address, phone number)",
        "Account credentials and login information",
        "Event details, guest lists, and seating arrangements you create",
        "Payment and billing information for transactions",
        "Device information, IP address, and browser type",
        "Usage data and analytics about how you interact with our platform",
        "Cookies and similar tracking technologies data",
      ],
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      items: [
        "To provide, maintain, and improve our seating arrangement services",
        "To process payments and manage your subscription",
        "To send you important updates, notifications, and service announcements",
        "To respond to your inquiries and provide customer support",
        "To personalize your experience and recommend relevant features",
        "To analyze usage patterns and optimize platform performance",
        "To detect, prevent, and address technical issues and security threats",
        "To comply with legal obligations and enforce our terms",
      ],
    },
    {
      icon: Share2,
      title: "Information Sharing & Disclosure",
      items: [
        "We do not sell your personal information to third parties",
        "Service providers who assist in platform operations (payment processors, hosting)",
        "Analytics providers to understand usage and improve services",
        "Law enforcement or regulatory authorities when legally required",
        "Business transfers in case of merger, acquisition, or asset sale",
        "With your explicit consent for specific purposes",
        "Publicly shared information you choose to make visible (event pages)",
      ],
    },
    {
      icon: Lock,
      title: "Data Security & Protection",
      items: [
        "Industry-standard encryption (SSL/TLS) for data transmission",
        "Secure cloud storage with regular backups and redundancy",
        "Access controls and authentication mechanisms to prevent unauthorized access",
        "Regular security audits and vulnerability assessments",
        "Employee training on data protection and privacy practices",
        "Incident response procedures for potential data breaches",
        "Compliance with GDPR, CCPA, and other applicable regulations",
      ],
    },
    {
      icon: Cookie,
      title: "Cookies & Tracking Technologies",
      items: [
        "Essential cookies for platform functionality and user authentication",
        "Analytics cookies to track usage patterns and performance metrics",
        "Preference cookies to remember your settings and customizations",
        "Marketing cookies for targeted advertising (with your consent)",
        "You can control cookie preferences through browser settings",
        "Disabling certain cookies may limit platform functionality",
        "We use Google Analytics, Facebook Pixel, and similar tools",
      ],
    },
    {
      icon: UserCheck,
      title: "Your Privacy Rights",
      items: [
        "Access: Request a copy of your personal data we hold",
        "Correction: Update or correct inaccurate information",
        "Deletion: Request deletion of your data (right to be forgotten)",
        "Portability: Receive your data in a structured, machine-readable format",
        "Objection: Object to processing of your data for certain purposes",
        "Restriction: Request limitation of data processing activities",
        "Withdraw consent: Opt-out of marketing communications at any time",
      ],
    },
    {
      icon: Download,
      title: "Data Retention & Deletion",
      items: [
        "Active account data is retained as long as your account exists",
        "Event data is stored for the duration of your subscription",
        "Payment records are kept for 7 years per legal requirements",
        "Deleted accounts are purged within 30 days of deletion request",
        "Backup copies may persist for up to 90 days for disaster recovery",
        "Anonymized analytics data may be retained indefinitely",
        "You can request data deletion by contacting our support team",
      ],
    },
    {
      icon: Globe,
      title: "International Data Transfers",
      items: [
        "Your data may be transferred and stored in different countries",
        "We ensure adequate safeguards for international data transfers",
        "Standard Contractual Clauses (SCCs) are used where applicable",
        "Transfers comply with GDPR and other international privacy laws",
        "Data processing agreements are in place with all vendors",
        "You acknowledge and consent to these transfers by using our services",
      ],
    },
    {
      icon: UserCheck,
      title: "Children's Privacy",
      items: [
        "Our services are not intended for users under 18 years of age",
        "We do not knowingly collect data from minors",
        "If we become aware of underage users, accounts will be terminated",
        "Parents can contact us to request deletion of a child's information",
        "Verification processes may be implemented to prevent underage access",
      ],
    },
    {
      icon: Bell,
      title: "Notifications & Communications",
      items: [
        "We send transactional emails related to your account and events",
        "Service announcements and important platform updates",
        "Optional marketing emails about new features and promotions",
        "You can unsubscribe from marketing emails at any time",
        "Critical security and legal notices cannot be opted out",
        "Communication preferences can be managed in account settings",
      ],
    },
    {
      icon: FileCheck,
      title: "Third-Party Services & Links",
      items: [
        "Our platform may integrate with third-party services (payment gateways, analytics)",
        "Third-party privacy policies govern their data practices",
        "We are not responsible for external websites or services",
        "Links to third-party sites are provided for convenience only",
        "Review privacy policies of any external services you use",
        "We vet third-party providers for security and compliance",
      ],
    },
    {
      icon: AlertCircle,
      title: "Changes to Privacy Policy",
      items: [
        "We may update this policy to reflect legal or operational changes",
        "Material changes will be communicated via email or platform notice",
        "Continued use after changes constitutes acceptance",
        "Last updated date is displayed at the top of this policy",
        "Previous versions are archived and available upon request",
        "We encourage periodic review of this privacy policy",
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
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Your privacy matters to us. Learn how we collect, use, and protect
            your information.
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
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Our Commitment to Your Privacy
              </h2>
              <p className="text-slate-700 leading-relaxed">
                At Digital Seating Arrangement, we are committed to protecting
                your privacy and ensuring the security of your personal
                information. This Privacy Policy explains how we collect, use,
                share, and safeguard your data when you use our platform. By
                accessing or using our services, you agree to the terms outlined
                in this policy.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {privacyData.map((section, index) => {
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

        {/* Contact for Privacy Concerns */}
        <div className="mt-12 bg-gradient-to-br from-orange-50/80 via-red-50/80 to-orange-50/80 border-2 border-orange-200/40 rounded-2xl p-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Privacy Questions or Concerns?
            </h3>
            <p className="text-slate-700 leading-relaxed mb-6">
              If you have any questions about this Privacy Policy, how we handle
              your data, or wish to exercise your privacy rights, please don't
              hesitate to contact us. Our Data Protection team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/50">
                <Mail className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-slate-700">
                  privacy@example.com
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/50">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-slate-700">
                  GDPR & CCPA Compliant
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Rights Request Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/50 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-orange-100 flex items-center justify-center">
              <Download className="h-6 w-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Request Your Data
            </h4>
            <p className="text-sm text-slate-600">
              Download a copy of all your personal information
            </p>
          </div>
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/50 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-100 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Delete Your Data
            </h4>
            <p className="text-sm text-slate-600">
              Request permanent deletion of your account data
            </p>
          </div>
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/50 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-green-100 flex items-center justify-center">
              <FileCheck className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Update Information
            </h4>
            <p className="text-sm text-slate-600">
              Correct or update your personal information
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center p-6 rounded-2xl bg-slate-50 border border-slate-200/50">
          <p className="text-slate-600 text-sm">
            For detailed privacy rights requests, please contact{" "}
            <a
              href="mailto:privacy@example.com"
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              privacy@example.com
            </a>{" "}
            or visit our{" "}
            <a
              href="/contact"
              className="text-orange-600 hover:text-orange-700 font-semibold underline"
            >
              contact page
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
