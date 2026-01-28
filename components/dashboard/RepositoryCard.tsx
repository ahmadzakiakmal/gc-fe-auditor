import { SiGithub } from "@icons-pack/react-simple-icons";
import { BookMarkedIcon } from "lucide-react";
import Link from "next/link";

interface RepositoryCardParams {
  name: string;
  id: number;
  githubUrl?: string;
}

export default function RepositoryCard({ name, id, githubUrl }: RepositoryCardParams) {
  const iconColors = [
    { textDark: "dark:text-emerald-500", textLight: "text-emerald-600", bg: "bg-emerald-600/20" },
    { textDark: "dark:text-amber-500", textLight: "text-amber-600", bg: "bg-amber-600/20" },
    { textDark: "dark:text-cyan-500", textLight: "text-cyan-600", bg: "bg-cyan-600/20" },
    { textDark: "dark:text-purple-500", textLight: "text-purple-600", bg: "bg-purple-600/20" },
  ];
  const selectedIconColor = iconColors[id % 4];
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 hover:shadow-md transition-shadow">
      {/* Repository Name */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`${selectedIconColor.bg} ${selectedIconColor.textLight} ${selectedIconColor.textDark} p-2 rounded-md`}
        >
          <BookMarkedIcon size={20} />
        </div>
        <h2 className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate flex-1">{name}</h2>
      </div>

      {/* Action Button */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <Link
          href={`/dashboard/repositories/${id}`}
          className="block flex-1"
        >
          <button className="text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-800 rounded-lg duration-200 w-full flex items-center justify-center h-9">
            View
          </button>
        </Link>
        {githubUrl ? (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="size-9 hover:bg-slate-200 dark:hover:bg-slate-700 flex justify-center items-center shrink-0 rounded-lg duration-200">
              <SiGithub size={20} />
            </button>
          </a>
        ) : null}
      </div>
    </div>
  );
}

