import Link from "next/link";

export default function NavigationItem({
  link,
  label,
  icon,
  active,
}: {
  link: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={link || "#"}
      className={`${
        active ? "bg-blue-gc outline-1 outline-white/40" : "bg-transparent"
      } flex items-center py-2 px-3.5 rounded-[10px] gap-2 cursor-pointer`}
    >
      <div className={`${active ? "text-white" : "text-grey-gc"}`}>{icon ? icon : null}</div>
      <label className={`${active ? "text-white" : "text-grey-gc"} text-[14px] font-medium cursor-pointer`}>{label}</label>
    </Link>
  );
}

