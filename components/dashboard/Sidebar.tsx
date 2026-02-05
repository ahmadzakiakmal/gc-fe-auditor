"use client";

import Image from "next/image";
import ThemeSwitcher from "../shared/ThemeSwitcher";
import GcLogo from "@/public/gardachain-logo-sm.png";
import GcLogoWhite from "@/public/gardachain-logo-white-sm.png";
import { usePathname } from "next/navigation";
import NavigationItem from "./NavigationLink";
import { House, Shield } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";
import { ReportStatus } from "@/types/types";

export default function Sidebar() {
  const path = usePathname();
  const { reports } = useSession();

  // Placeholder recent audits - no API calls
  const recentAudits = reports
    ? reports
        ?.filter((report) => report.status == ReportStatus.QUEUE || report.status == ReportStatus.AUDITOR_REVIEW)
        .slice(0, 3)
    : null;

  const mainLinks = [
    { label: "Dashboard", link: "/dashboard", icon: <House size={16} />, active: path === "/dashboard" },
    {
      label: "All Audits",
      link: "/dashboard/audits",
      icon: <Shield size={16} />,
      active: path === "/dashboard/audits",
    },
  ];

  if (!path?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <aside className="font-family-jakarta flex flex-col justify-between p-10 bg-white dark:bg-dark-secondary outline-dark-primary/20 dark:outline-white/20 outline-1 w-68.75 min-h-screen shrink-0">
      <div>
        <Link
          href="/"
          className="flex gap-2.5 items-center justify-center"
        >
          <Image
            src={GcLogo}
            className="w-12.5 h-auto dark:hidden"
            alt="GardaChain Logo"
          />
          <Image
            src={GcLogoWhite}
            className="w-12.5 h-auto hidden dark:block opacity-80"
            alt="GardaChain Logo"
          />
          <div className="flex flex-col">
            <span className="text-[20px] font-semibold leading-tight">
              <span className="text-blue-gc-dark dark:text-slate-200">Garda</span>
              <span className="text-red-gc dark:text-slate-200">Chain</span>
            </span>
            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
              Auditor
            </span>
          </div>
        </Link>

        <hr className="border-slate-300 dark:border-slate-700 mt-4 mb-12.5" />

        <h1 className="text-grey-gc font-bold text-[14px] mb-2.5">MAIN</h1>
        <div className="flex flex-col gap-2.5">
          {mainLinks.map((item) => (
            <NavigationItem
              key={item.label}
              link={item.link}
              label={item.label}
              icon={item.icon}
              active={item.active}
            />
          ))}
        </div>

        <h1 className="text-grey-gc font-bold text-[14px] mb-2.5 mt-5">RECENT AUDITS</h1>
        <div className="flex flex-col gap-2.5">
          {recentAudits == null && (
            <>
              <div className="h-10 w-full bg-slate-300 dark:bg-slate-700 animate-pulse rounded-sm"></div>
              <div className="h-10 w-full bg-slate-300 dark:bg-slate-700 animate-pulse rounded-sm"></div>
            </>
          )}
          {recentAudits &&
            recentAudits.slice(0, 3).map((audit) => (
              <Link
                key={audit.id}
                href={`/dashboard/audits/${audit.id}`}
                className={`flex flex-col gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                  path === `/dashboard/audits/${audit.id}` || path === `/dashboard/audits/reports/${audit.id}`
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield
                    size={14}
                    className="text-purple-600 dark:text-purple-400 shrink-0"
                  />
                  <span className="text-sm font-medium truncate">{audit.repo_url.split("/")[4]}</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-500 pl-5">
                  by {audit.repo_url.split("/")[3]}
                </span>
              </Link>
            ))}
        </div>
      </div>

      <div className="mx-auto">
        <ThemeSwitcher />
      </div>
    </aside>
  );
}

