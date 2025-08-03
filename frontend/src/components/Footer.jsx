import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const Footer = () => (
  <footer className="bg-gray-800 text-white w-full">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Link to="/" className="flex items-center mb-4">
            <Home className="w-6 h-6 text-emerald-400" />
            <span className="ml-2 text-xl font-bold">QuickNest</span>
          </Link>
          <p className="text-gray-300 text-sm max-w-sm">
            Connecting you with trusted local professionals for all your service
            needs. Quality, reliability, and convenience in one platform.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-emerald-400">
            Quick Links
          </h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>
              <Link
                to="/service"
                className="hover:text-emerald-400 transition-colors"
              >
                All Services
              </Link>
            </li>
            <li>
              <a
                href="#how-it-works"
                className="hover:text-emerald-400 transition-colors"
              >
                How it Works
              </a>
            </li>
            <li>
              <a
                href="#testimonials"
                className="hover:text-emerald-400 transition-colors"
              >
                Customer Reviews
              </a>
            </li>
            <li>
              <Link
                to="/support"
                className="hover:text-emerald-400 transition-colors"
              >
                Support
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-emerald-400">
            Get in Touch
          </h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-emerald-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span>support@quicknest.com</span>
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-emerald-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.2 2.2zm4.69-2.97c-.47-.23-.85-.66-1.01-1.17-.16-.51-.1-1.06.17-1.54l2.2-2.2c.27-.27.67-.36 1.02-.24.37.12.71.29 1.03.49.51.31.89.82 1.05 1.39.16.57.09 1.16-.19 1.67l-2.2 2.2c-.28.28-.69.36-1.04.24-.35-.12-.68-.29-1.03-.49z" />
              </svg>
              <span>+1 (555) 987-6543</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gray-400 text-sm">
          © 2025 QuickNest. All rights reserved.
        </p>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <a
            href="#"
            className="text-gray-300 hover:text-emerald-400 text-sm transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-gray-300 hover:text-emerald-400 text-sm transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
