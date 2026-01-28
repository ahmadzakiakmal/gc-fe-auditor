"use client";
import Image from "next/image";
import { Github, Shield } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GcLogo from "@/public/gardachain-logo.png";
import GcLogoWhite from "@/public/gardachain-logo-white-sm.png";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";

export default function AuditorAuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleGithubLogin() {
    try {
      setIsLoading(true);
      // TODO: Implement GitHub OAuth for auditors
      console.log("Auditor GitHub login clicked");
      // On success, redirect to /dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="font-family-jakarta bg-light-secondary dark:bg-dark-primary text-dark dark:text-white w-full h-screen overflow-y-auto flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-8">
        <div className="flex items-center gap-3">
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
            className="hidden dark:block"
            alt="GardaChain Logo"
          />
          <span className="text-xl font-bold">
            <span className="text-blue-gc-dark dark:text-white">Garda</span>
            <span className="text-red-gc dark:text-white">Chain</span>
            <span className="text-slate-500 dark:text-slate-400 ml-2 text-sm">Auditor</span>
          </span>
        </div>

        <ThemeSwitcher />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 pb-16">
        <div className="max-w-md w-full">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-6 rounded-full">
              <Shield className="size-16 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center mb-8">
            <h1 className="text-[32px] font-bold text-slate-700 dark:text-slate-200 mb-3">Auditor Portal</h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Access your audit dashboard to review smart contracts and submit findings
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <button
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 duration-200 rounded-md py-3 px-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Github className="size-5" />
              <span>{isLoading ? "Connecting to GitHub..." : "Continue with GitHub"}</span>
            </button>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Auditor capabilities:</p>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                  Review paid audit requests
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                  Create custom audit flows
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                  Submit findings and reports
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                  Validate developer remediations
                </p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-6">
            Authorized auditors only • Secure access via GitHub
          </p>
        </div>
      </div>
    </main>
  );
}

