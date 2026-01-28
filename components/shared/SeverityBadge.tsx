export default function SeverityBadge({ level, className }: { level: "low" | "medium" | "high"; className?: string }) {
  let badgeClass = "";

  switch (level) {
    case "low":
      badgeClass =
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      break;
    case "medium":
      badgeClass =
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      break;
    case "high":
      badgeClass = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      break;
    default:
      badgeClass = "bg-slate-200 dark:bg-slate-800 animate-pulse border-slate-300 dark:border-slate-700";
  }

  return (
    <div className={`${badgeClass} border rounded-full font-semibold text-[12px] px-3 py-1 text-center ${className}`}>
      {level !== "low" && level !== "medium" && level !== "high" ? "" : toCamelCase(level)}
    </div>
  );
}

function toCamelCase(str: string) {
  return str[0].toUpperCase() + str.slice(1, str.length);
}
