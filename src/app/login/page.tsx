"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function LoginContent() {
  const { user, isLoading, signInWithFacebook } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const redirectTo = searchParams.get("redirectTo") || "/";

  useEffect(() => {
    if (user && !isLoading) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  const handleFacebookSignIn = async () => {
    try {
      setError(null);
      setIsSigningIn(true);
      await signInWithFacebook(redirectTo);
    } catch (err) {
      setError("Failed to sign in with Facebook. Please try again.");
      setIsSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-slate-900">VolunTy</h1>
          </Link>
          <p className="mt-3 text-slate-600">
            Sign in to manage your volunteer schedule
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose your preferred sign-in method
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Facebook Sign In */}
            <button
              onClick={handleFacebookSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 rounded-lg bg-[#1877F2] px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {isSigningIn ? "Signing in..." : "Continue with Facebook"}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">
                Secure authentication
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            By signing in, you agree to our{" "}
            <a href="#" className="text-slate-700 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-slate-700 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        <p className="text-center text-sm text-slate-500">
          <Link href="/" className="text-slate-700 hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
