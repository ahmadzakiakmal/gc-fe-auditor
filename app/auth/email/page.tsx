"use client";

import ContentCard from "@/components/shared/ContentCard";
import { Mail, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { setEmail } from "@/lib/api/data";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";

export default function SetEmailPage() {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [email, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function validateEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      await setEmail(email);

      toast.success("Email address saved successfully!");

      // Refresh session to get updated user data
      await refreshSession();

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to set email:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save email address";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="font-family-jakarta bg-light-secondary dark:bg-slate-950 w-full min-h-screen flex items-center justify-center p-6">
      <ContentCard className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-[28px] font-semibold text-blue-gc-dark dark:text-white mb-2">Email Required</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            We couldn&apos;t retrieve your email from GitHub. Please provide your email address to continue using our
            service.
          </p>
        </div>

        {/* Why We Need Email */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-1">
                Why do we need your email?
              </h3>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Notify you about audit progress and results</li>
                <li>• Send important security findings</li>
                <li>• Communicate about your account</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">
              EMAIL ADDRESS <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setError("");
                }}
                disabled={isSubmitting}
                placeholder="your.email@example.com"
                className={`w-full pl-11 pr-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 ${
                  error
                    ? "border-red-300 dark:border-red-700 focus:ring-red-400 dark:focus:ring-red-600"
                    : "border-slate-200 dark:border-slate-700 focus:ring-blue-400 dark:focus:ring-blue-600"
                }`}
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 duration-200 rounded-md py-2.5 px-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Continue to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Privacy Notice */}
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
          Your email will be used solely for service notifications and account management. We respect your privacy and
          won&apos;t share your information with third parties.
        </p>
      </ContentCard>
    </main>
  );
}

