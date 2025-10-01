"use client";
import { Link } from "react-router-dom";
import { Home, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white w-full border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center mb-6">
              <Home className="w-6 h-6 text-emerald-500" />
              <span className="ml-2 text-xl font-bold">QuickNest</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting you with trusted local professionals for all your
              service needs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/services", text: "All Services" },
                { to: "/how-it-works", text: "How it Works" },
                { to: "/reviews", text: "Customer Reviews" },
                { to: "/support", text: "Support" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-emerald-500 text-sm transition-colors duration-200"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white">
              Popular Services
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/services?skill=plumber", text: "Plumbing" },
                { to: "/services?skill=electrician", text: "Electrical" },
                { to: "/services?skill=beauty", text: "Beauty & Salon" },
                { to: "/services?skill=cleaner", text: "Home Cleaning" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-emerald-500 text-sm transition-colors duration-200"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start text-sm text-gray-400">
                <Mail className="w-4 h-4 mr-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                <span>support@quicknest.com</span>
              </li>
              <li className="flex items-start text-sm text-gray-400">
                <Phone className="w-4 h-4 mr-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                <span>+91 7205882737</span>
              </li>
              <li className="flex items-start text-sm text-gray-400">
                <MapPin className="w-4 h-4 mr-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                <span>Available in 50+ cities across India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 QuickNest. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                to="/privacy-policy"
                className="text-gray-400 hover:text-emerald-500 text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="text-gray-400 hover:text-emerald-500 text-sm transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
