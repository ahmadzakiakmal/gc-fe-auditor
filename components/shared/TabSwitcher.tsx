import { Dispatch, SetStateAction } from "react";
interface TabData {
  label: string;
  value: string;
}

export default function TabSwitcher({
  data,
  state,
  setState,
}: {
  data: TabData[];
  state: string;
  setState: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="rounded-lg bg-slate-200 dark:bg-slate-950 w-fit p-2 font-semibold flex gap-1 items-center">
      {data.map((d) => (
        <button
          type="button"
          onClick={() => setState(d.value)}
          className={`${state == d.value ? "bg-white dark:bg-slate-500 text-dark dark:text-white shadow-md dark:shadow-slate-700" : "text-slate-500"} px-2.5 py-2 rounded-md text-[12px]`}
          key={d.value}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

