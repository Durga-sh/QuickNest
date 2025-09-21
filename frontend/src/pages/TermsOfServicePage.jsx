import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Users,
  CreditCard,
  Shield,
  AlertTriangle,
  Scale,
} from "lucide-react";
const TermsOfServicePage = () => {
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
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these terms carefully before using our platform and
            services.
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
            Welcome to QuickNest! These Terms of Service ("Terms") govern your
            use of our platform and services. By accessing or using QuickNest,
            you agree to be bound by these Terms and our Privacy Policy.
          </p>
          <p className="text-gray-700 leading-relaxed">
            If you do not agree with any part of these terms, you may not access
            or use our services.
          </p>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Platform Description
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              QuickNest is an online platform that connects customers with local
              service providers for various home and business services including
              cleaning, plumbing, electrical work, and other professional
              services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We act as an intermediary platform and do not directly provide the
              services. All services are performed by independent service
              providers who use our platform.
            </p>
          </div>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center mb-6">
            <Users className="w-8 h-8 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              User Accounts
            </h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Account Creation
              </h3>
              <p className="text-gray-700">
                You must create an account to use our services. You are
                responsible for maintaining the confidentiality of your account
                credentials and all activities under your account.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Eligibility
              </h3>
              <p className="text-gray-700">
                You must be at least 18 years old and have the legal capacity to
                enter into contracts. By using our services, you represent that
                you meet these requirements.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Account Accuracy
              </h3>
              <p className="text-gray-700">
                You agree to provide accurate, current, and complete information
                during registration and to update such information to keep it
                accurate and current.
              </p>
            </div>
          </div>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center mb-6">
            <CreditCard className="w-8 h-8 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Service Bookings and Payments
            </h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Booking Process
              </h3>
              <p className="text-gray-700">
                When you book a service, you enter into a direct agreement with
                the service provider. We facilitate this connection but are not
                a party to the service agreement.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Payment Terms
              </h3>
              <p className="text-gray-700">
                Payments are processed securely through our platform. You agree
                to pay all charges associated with your bookings, including
                service fees and applicable taxes.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cancellation Policy
              </h3>
              <p className="text-gray-700">
                Cancellations must be made at least 24 hours before the
                scheduled service time to avoid cancellation fees. Emergency
                cancellations may be considered on a case-by-case basis.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Refunds
              </h3>
              <p className="text-gray-700">
                Refunds are processed according to our refund policy and may
                depend on the nature of the service and timing of the
                cancellation or dispute.
              </p>
            </div>
          </div>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              User Responsibilities
            </h2>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              You agree to:
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">â€¢</span>
                Use the platform only for lawful purposes and in accordance with
                these Terms
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">â€¢</span>
                Provide accurate and truthful information in all interactions
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">â€¢</span>
                Treat service providers with respect and professionalism
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">â€¢</span>
                Be present at the scheduled service time or notify in advance of
                any changes
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">â€¢</span>
                Report any issues or concerns promptly through appropriate
                channels
              </li>
            </ul>
            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">
              You agree not to:
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">â€¢</span>
                Use the platform for any illegal or unauthorized purpose
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">â€¢</span>
                Attempt to circumvent our payment system or engage in fraudulent
                activities
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">â€¢</span>
                Harass, abuse, or discriminate against service providers or
                other users
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">â€¢</span>
                Interfere with or disrupt the operation of our platform
              </li>
            </ul>
          </div>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Service Provider Terms
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Verification and Background Checks
              </h3>
              <p className="text-gray-700">
                All service providers undergo verification processes including
                background checks, credential verification, and skill
                assessments before being approved.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Service Standards
              </h3>
              <p className="text-gray-700">
                Service providers must maintain professional standards, arrive
                on time, complete work as agreed, and treat customers with
                respect and professionalism.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Insurance and Liability
              </h3>
              <p className="text-gray-700">
                Service providers are required to maintain appropriate insurance
                coverage and are responsible for their own actions and any
                damages they may cause.
              </p>
            </div>
          </div>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center mb-6">
            <AlertTriangle className="w-8 h-8 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Platform Disclaimers
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              <strong>Service Quality:</strong> While we verify our service
              providers, we do not guarantee the quality of services performed.
              Disputes should be resolved directly between customers and service
              providers, with our platform available for mediation if needed.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Platform Availability:</strong> We strive to maintain
              platform availability but do not guarantee uninterrupted service.
              We may perform maintenance or updates that temporarily affect
              access.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Third-Party Services:</strong> Our platform integrates
              with third-party services for payments, mapping, and
              communications. We are not responsible for the performance or
              policies of these third-party services.
            </p>
          </div>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center mb-6">
            <Scale className="w-8 h-8 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Limitation of Liability
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, QuickNest shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, including loss of profits, data, or business
              opportunities.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our total liability for any claims arising from your use of our
              platform shall not exceed the total amount you paid to us in the
              twelve months preceding the claim.
            </p>
          </div>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Intellectual Property
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All content, features, and functionality on our platform are owned
            by QuickNest and are protected by copyright, trademark, and other
            intellectual property laws.
          </p>
          <p className="text-gray-700 leading-relaxed">
            You may not copy, modify, distribute, or create derivative works
            based on our platform without explicit written permission.
          </p>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Termination
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You may terminate your account at any time by contacting our support
            team. We may terminate or suspend your account if you violate these
            Terms or engage in harmful behavior.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Upon termination, your right to use the platform will cease
            immediately, but these Terms will remain in effect regarding past
            use of our services.
          </p>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Governing Law
          </h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms are governed by and construed in accordance with the
            laws of India. Any disputes arising from these Terms or your use of
            our platform will be subject to the exclusive jurisdiction of the
            courts in Hyderabad, India.
          </p>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Changes to Terms
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We may update these Terms from time to time. We will notify you of
            any material changes by posting the updated Terms on our platform
            and updating the "Last updated" date. Your continued use of our
            services after such changes constitutes acceptance of the new Terms.
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
            If you have any questions about these Terms of Service, please
            contact us:
          </p>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Email:</strong> legal@quicknest.com
            </p>
            <p>
              <strong>Phone:</strong> +91 7205882737
            </p>
            <p>
              <strong>Address:</strong> 123 Tech Park, Hyderabad, India
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
export default TermsOfServicePage;
