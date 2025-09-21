import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, UserCheck, Database, Globe } from "lucide-react";
const PrivacyPolicyPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide when creating an account, booking services, or contacting us, including your name, email address, phone number, and address.",
        },
        {
          subtitle: "Service Information",
          text: "Details about the services you book, preferences, special requirements, and feedback you provide about service providers.",
        },
        {
          subtitle: "Payment Information",
          text: "We securely process payment information through encrypted third-party payment processors. We do not store your complete payment card details.",
        },
        {
          subtitle: "Usage Data",
          text: "Information about how you use our platform, including device information, IP address, browser type, and interaction patterns.",
        },
      ],
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Provision",
          text: "To facilitate bookings, connect you with service providers, process payments, and provide customer support.",
        },
        {
          subtitle: "Communication",
          text: "To send you booking confirmations, updates, notifications, and respond to your inquiries.",
        },
        {
          subtitle: "Platform Improvement",
          text: "To analyze usage patterns, improve our services, develop new features, and enhance user experience.",
        },
        {
          subtitle: "Safety and Security",
          text: "To verify identities, prevent fraud, ensure platform safety, and comply with legal requirements.",
        },
      ],
    },
    {
      icon: Globe,
      title: "Information Sharing",
      content: [
        {
          subtitle: "Service Providers",
          text: "We share necessary booking information with service providers to enable them to complete your requested services.",
        },
        {
          subtitle: "Payment Processors",
          text: "Payment information is shared with secure third-party payment processors to complete transactions.",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law, to protect our rights, or to ensure user safety.",
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale, user information may be transferred to the new entity.",
        },
      ],
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        {
          subtitle: "Encryption",
          text: "All sensitive data is encrypted both in transit and at rest using industry-standard encryption protocols.",
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls and authentication measures to protect your data from unauthorized access.",
        },
        {
          subtitle: "Regular Audits",
          text: "We conduct regular security audits and vulnerability assessments to maintain the highest security standards.",
        },
        {
          subtitle: "Data Backup",
          text: "Your data is regularly backed up to secure servers to prevent data loss and ensure business continuity.",
        },
      ],
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: [
        {
          subtitle: "Access and Portability",
          text: "You have the right to access, review, and download your personal information stored on our platform.",
        },
        {
          subtitle: "Correction and Updates",
          text: "You can update or correct your personal information through your account settings at any time.",
        },
        {
          subtitle: "Deletion",
          text: "You may request deletion of your account and personal data, subject to legal and contractual obligations.",
        },
        {
          subtitle: "Opt-Out",
          text: "You can opt out of non-essential communications and marketing materials at any time.",
        },
      ],
    },
    {
      icon: Shield,
      title: "Data Retention",
      content: [
        {
          subtitle: "Account Information",
          text: "We retain your account information while your account is active and for a reasonable period after account closure.",
        },
        {
          subtitle: "Transaction Records",
          text: "Booking and payment records are retained for accounting, legal, and tax purposes as required by law.",
        },
        {
          subtitle: "Communication Records",
          text: "Customer support communications are retained to improve service quality and resolve future issues.",
        },
        {
          subtitle: "Anonymous Analytics",
          text: "Aggregated and anonymized usage data may be retained indefinitely for platform improvement purposes.",
        },
      ],
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 1, 2025
          </p>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Introduction
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            QuickNest ("we," "our," or "us") is committed to protecting your
            privacy and maintaining the security of your personal information.
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you use our platform and services.
          </p>
          <p className="text-gray-700 leading-relaxed">
            By using QuickNest, you agree to the collection and use of
            information in accordance with this policy. We encourage you to read
            this Privacy Policy carefully to understand our practices regarding
            your personal information.
          </p>
        </motion.div>
        {}
        {sections.map((section, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
            variants={itemVariants}
          >
            <div className="flex items-center mb-6">
              <section.icon className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
                {section.title}
              </h2>
            </div>
            <div className="space-y-6">
              {section.content.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {item.subtitle}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Cookies and Tracking Technologies
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Essential Cookies
              </h3>
              <p className="text-gray-700">
                We use essential cookies that are necessary for our platform to
                function properly, including authentication, security, and basic
                functionality cookies.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analytics Cookies
              </h3>
              <p className="text-gray-700">
                We use analytics cookies to understand how users interact with
                our platform, helping us improve our services and user
                experience.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cookie Management
              </h3>
              <p className="text-gray-700">
                You can control cookie settings through your browser
                preferences. Note that disabling certain cookies may affect
                platform functionality.
              </p>
            </div>
          </div>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Third-Party Services
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our platform integrates with various third-party services to enhance
            functionality:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">â€¢</span>
              Payment processors for secure transaction handling
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">â€¢</span>
              Mapping services for location-based features
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">â€¢</span>
              Communication services for notifications and messaging
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">â€¢</span>
              Analytics tools for platform improvement
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            These third-party services have their own privacy policies, and we
            encourage you to review them.
          </p>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Children's Privacy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Our services are not intended for individuals under the age of 18.
            We do not knowingly collect personal information from children under
            18. If you believe we have inadvertently collected information from
            a child under 18, please contact us immediately so we can delete
            such information.
          </p>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            International Users
          </h2>
          <p className="text-gray-700 leading-relaxed">
            If you are accessing our services from outside India, please note
            that your information may be transferred to, stored, and processed
            in India where our servers are located. By using our services, you
            consent to such transfer and processing in accordance with this
            Privacy Policy.
          </p>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Policy Updates
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or legal requirements. We will notify you
            of any material changes by posting the updated policy on our
            platform and updating the "Last updated" date. Your continued use of
            our services after such changes constitutes acceptance of the
            updated policy.
          </p>
        </motion.div>
        {}
        <motion.div
          className="bg-emerald-50 rounded-lg p-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions, concerns, or requests regarding this
            Privacy Policy or our data practices, please contact us:
          </p>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Email:</strong> privacy@quicknest.com
            </p>
            <p>
              <strong>Phone:</strong> +91 7205882737
            </p>
            <p>
              <strong>Address:</strong> 123 Tech Park, Hyderabad, India
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed mt-4">
            We will respond to your inquiries within 30 days and work to address
            any concerns you may have.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
export default PrivacyPolicyPage;
