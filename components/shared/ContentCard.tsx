import React from "react";

export default function ContentCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={
        "p-7.5 bg-white dark:bg-slate-900 text-dark dark:text-slate-200 rounded-[20px] dark:outline dark:outline-white/20 shadow-[0_2px_6px_rgba(0,0,50,.25)] " +
        className
      }
    >
      {children}
    </div>
  );
}

