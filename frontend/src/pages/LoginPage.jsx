import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import LoginForm from "../components/auth/LoginForm";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import { Sparkles, Shield, Users, ArrowLeft } from "lucide-react";

const LoginPage = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-emerald-200 rounded-full opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-16 h-16 bg-teal-200 rounded-full opacity-20"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8"
          variants={itemVariants}
        >
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <Link to="/" className="inline-block">
              <motion.h1
                className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                QuickNest
              </motion.h1>
            </Link>
            <motion.p
              className="text-gray-600 flex items-center justify-center"
              variants={itemVariants}
            >
              <Shield className="w-4 h-4 mr-2 text-emerald-600" />
              Sign in to your account
            </motion.p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <LoginForm />
          </motion.div>

          <motion.div
            className="mt-6 relative flex items-center justify-center"
            variants={itemVariants}
          >
            <div className="border-t border-gray-300 absolute w-full"></div>
            <div className="bg-white/90 px-4 relative z-10 text-gray-500 text-sm">
              OR
            </div>
          </motion.div>

          <motion.div className="mt-6" variants={itemVariants}>
            <GoogleAuthButton />
          </motion.div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          className="absolute -top-4 -right-4 bg-emerald-100 rounded-full p-3 shadow-lg"
          variants={floatingVariants}
          animate="animate"
        >
          <Sparkles className="w-6 h-6 text-emerald-600" />
        </motion.div>

        <motion.div
          className="absolute -bottom-4 -left-4 bg-teal-100 rounded-full p-3 shadow-lg"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "1s" }}
        >
          <Users className="w-6 h-6 text-teal-600" />
        </motion.div>
      </motion.div>

      {/* Back to home button */}
      <motion.div
        className="absolute top-8 left-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Link
          to="/"
          className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default LoginPage;
