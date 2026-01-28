import { ChevronRight } from "lucide-react";
import Link from "next/link";

export type BreadcrumbData = {
  label: string | null;
  url: string | null;
};

export default function Breadcrumb({ className, data }: { className?: string; data: BreadcrumbData[] }) {
  return (
    <div className={"flex text-blue-gc-dark dark:text-grey-gc font-semibold " + className}>
      {data.map((d, index) =>
        d.url !== null && d.label !== null ? (
          <div
            className="flex items-center"
            key={d.url}
          >
            <Link
              href={d.url}
              className="hover:bg-blue-gc-dark/10 px-2 py-1 rounded-md"
            >
              {d.label}
            </Link>
            {isTheLastBreadcrumb(index, data.length) ? null : <ChevronRight className="my-2.5" />}
          </div>
        ) : null
      )}
    </div>
  );
}

function isTheLastBreadcrumb(index: number, length: number) {
  return index === length - 1;
}

