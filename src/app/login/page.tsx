'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSignUp) {
      // Handle Sign Up
      try {
        const signUpResponse = await fetch("http://localhost:8000/api/signup/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, username }),
        });

        const signUpData = await signUpResponse.json();
        if (!signUpResponse.ok) {
          throw new Error(signUpData.error || "Signup failed.");
        }

        // Automatically sign in after successful registration
        const res = await signIn("credentials", { redirect: false, email, password });
        if (!res?.ok) {
          throw new Error(res?.error || "Login after signup failed.");
        }
        
        setSuccessMsg("Aapka Swagat Hai Payroll Management System Mein.");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Handle Sign In
      try {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (!res?.ok) {
          throw new Error(res?.error || "Invalid email or password");
        }

        setSuccessMsg("Aapka Swagat Hai Payroll Management System Mein.");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 px-4">
      {successMsg && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-300 text-green-800 px-6 py-3 rounded-xl shadow-lg z-50 text-lg font-semibold">
          {successMsg}
        </div>
      )}
      <div className="flex w-full max-w-4xl bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl shadow-black-250/60 overflow-hidden border border-black/30">
        {/* Left Side: Image */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-yellow-100">
          <img
            src="https://static.vecteezy.com/system/resources/previews/033/836/740/non_2x/payroll-salary-payment-with-tiny-people-character-concept-office-accounting-administrative-or-calendar-pay-date-employee-wages-concept-flat-modern-illustration-vector.jpg"
            alt="Payroll Illustration"
            className="object-cover w-full h-full max-h-[600px] p-6"
          />
        </div>
        {/* Right Side: Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {isSignUp ? 'Create an Account' : 'Welcome Back'}
              </h1>
              <p className="text-gray-600">
                {isSignUp ? 'Fill in the details to get started' : 'Sign in to continue to your account'}
              </p><br></br>
            </div>

            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:border-gray-400 hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50 group"
            >
              <FcGoogle className="w-5 h-5" />
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </button><br></br>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isSignUp && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Choose a username"
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-yellow-400 to-yellow-200 hover:from-yellow-500 hover:to-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-200 hover:shadow-lg"
              >
                {loading ? (isSignUp ? "Signing up..." : "Signing in...") : (isSignUp ? "Sign Up" : "Sign In")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 