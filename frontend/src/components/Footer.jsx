"use client";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { motion } from "framer-motion";
const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };
  return (
    <motion.footer
      className="bg-gray-800 text-white w-full"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <motion.div whileHover="hover">
              <Link to="/" className="flex items-center mb-4">
                <motion.div variants={iconVariants}>
                  <Home className="w-6 h-6 text-emerald-400" />
                </motion.div>
                <motion.span
                  className="ml-2 text-xl font-bold"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  QuickNest
                </motion.span>
              </Link>
            </motion.div>
            <motion.p
              className="text-gray-300 text-sm max-w-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Connecting you with trusted local professionals for all your
              service needs. Quality, reliability, and convenience in one
              platform.
            </motion.p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <motion.h3
              className="text-lg font-semibold mb-4 text-emerald-400"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              Quick Links
            </motion.h3>
            <motion.ul
              className="space-y-2 text-gray-300 text-sm"
              variants={containerVariants}
            >
              {[
                { to: "/services", text: "All Services" },
                { to: "/how-it-works", text: "How it Works" },
                { to: "/reviews", text: "Customer Reviews" },
                { to: "/support", text: "Support" },
              ].map((link, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {link.to ? (
                    <Link
                      to={link.to}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {link.text}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {link.text}
                    </a>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          <motion.div variants={itemVariants}>
            <motion.h3
              className="text-lg font-semibold mb-4 text-emerald-400"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              Get in Touch
            </motion.h3>
            <motion.ul
              className="space-y-2 text-gray-300 text-sm"
              variants={containerVariants}
            >
              <motion.li
                className="flex items-center"
                variants={itemVariants}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <motion.svg
                  className="w-4 h-4 mr-2 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  whileHover={{
                    scale: 1.2,
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.5 },
                  }}
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </motion.svg>
                <span>support@quicknest.com</span>
              </motion.li>
              <motion.li
                className="flex items-center"
                variants={itemVariants}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <motion.svg
                  className="w-4 h-4 mr-2 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  whileHover={{
                    scale: 1.2,
                    rotate: [0, 15, -15, 0],
                    transition: { duration: 0.6 },
                  }}
                >
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.2 2.2zm4.69-2.97c-.47-.23-.85-.66-1.01-1.17-.16-.51-.1-1.06.17-1.54l2.2-2.2c.27-.27.67-.36 1.02-.24.37.12.71.29 1.03.49.51.31.89.82 1.05 1.39.16.57.09 1.16-.19 1.67l-2.2 2.2c-.28.28-.69.36-1.04.24-.35-.12-.68-.29-1.03-.49z" />
                </motion.svg>
                <span>+91 7205882737</span>
              </motion.li>
            </motion.ul>
          </motion.div>
        </motion.div>
        <motion.div
          className="mt-8 pt-8 border-t border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.p
            className="text-gray-400 text-sm"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            Â© 2025 QuickNest. All rights reserved.
          </motion.p>
          <motion.div
            className="flex space-x-4 mt-4 sm:mt-0"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { to: "/privacy-policy", text: "Privacy Policy" },
              { to: "/terms-of-service", text: "Terms of Service" },
            ].map((link, index) => (
              <motion.div key={index}>
                <Link
                  to={link.to}
                  className="text-gray-300 hover:text-emerald-400 text-sm transition-colors"
                >
                  <motion.span
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.text}
                  </motion.span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.footer>
  );
};
export default Footer;
