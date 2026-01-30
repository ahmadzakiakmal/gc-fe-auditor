"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import Image from "next/image";
import GcLogo from "@/public/gardachain-logo-sm.png";
import GcLogoWhite from "@/public/gardachain-logo-white-sm.png";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams.get("error") || "Unknown Error";
  const message = searchParams.get("message") || "An unexpected error occurred";

  return (
    <main className="bg-light-secondary dark:bg-dark-primary text-dark dark:text-white w-full h-screen flex flex-col items-center justify-center px-8">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <Image
          src={GcLogo}
          width={40}
          height={40}
          className="dark:hidden"
          alt="GardaChain Logo"
        />
        <Image
          src={GcLogoWhite}
          width={40}
          height={40}
          className="hidden dark:block opacity-80"
          alt="GardaChain Logo"
        />
        <span className="text-xl font-bold">
          <span className="text-blue-gc-dark dark:text-white">Garda</span>
          <span className="text-red-gc dark:text-white">Chain</span>
        </span>
      </div>

      {/* Error Card */}
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-8 shadow-lg">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
            <AlertCircle className="size-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-200 text-center mb-2">{error}</h1>

        {/* Error Message */}
        <p className="text-slate-600 dark:text-slate-400 text-center mb-6">{message}</p>

        {/* Common Error Messages Help */}
        {message.toLowerCase().includes("user not found") && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Tip:</strong> If you&apos;re an auditor, please use the{" "}
              <a
                href="/auditor/login"
                className="underline font-semibold"
              >
                Auditor Portal
              </a>{" "}
              to sign in.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-800 duration-200 rounded-md py-3 px-4 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full font-semibold text-white bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 duration-200 rounded-md py-3 px-4 flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Return Home
          </button>
        </div>
      </div>

      {/* Help Text */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 text-center max-w-md">
        If this problem persists, please contact support or check your account permissions.
      </p>
    </main>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-light-secondary dark:bg-dark-primary w-full h-screen flex items-center justify-center">
          <div className="text-slate-600 dark:text-slate-400">Loading...</div>
        </main>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}

