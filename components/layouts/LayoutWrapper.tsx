"use client";

import { usePathname } from "next/navigation";
import Sidebar from "../dashboard/Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  if (path?.startsWith("/dashboard")) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return <>{children}</>;
}

