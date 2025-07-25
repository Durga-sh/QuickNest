"use client";
import { Link } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

const RegisterPage = () => {
  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-slate-800 rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-violet-400 bg-clip-text text-transparent">
              IntelliMeet
            </h1>
          </Link>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        <RegisterForm />

        <div className="mt-6 relative flex items-center justify-center">
          <div className="border-t border-slate-700 absolute w-full"></div>
          <div className="bg-slate-800 px-4 relative z-10 text-gray-400 text-sm">
            OR
          </div>
        </div>

        <div className="mt-6">
          <GoogleAuthButton />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
