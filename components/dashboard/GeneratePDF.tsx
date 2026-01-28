import { X } from "lucide-react";
import ContentCard from "../shared/ContentCard";
import { Dispatch, SetStateAction, useState } from "react";
import { generatePdfReport } from "../../../lib/api/data";
import { toast } from "react-toastify";

export default function GeneratePDF({
  isModalOpen,
  setIsModalOpen,
  reportId,
}: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  reportId: number;
}) {
  const [projectName, setProjectName] = useState<string>("");

  async function handleSubmit() {
    if (reportId == null) return;
    try {
      const response = await generatePdfReport(reportId, projectName);
      console.log(response);
      window.open(process.env.NEXT_PUBLIC_GC_BASE_URL + response.pdf_url, "_blank")?.focus();
      setIsModalOpen(false);
      setProjectName("");
    } catch (error) {
      console.log(error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  }

  return (
    <div className={`${isModalOpen ? "flex justify-center items-center fixed inset-0 z-50" : "hidden"}`}>
      <div
        onClick={() => setIsModalOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      ></div>

      <ContentCard className="relative z-10 w-[90%] max-w-[600px]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <h1 className="font-semibold text-[20px] text-slate-700 dark:text-slate-200">Generate PDF Report</h1>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 duration-200"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="flex flex-col mb-4">
            <label
              htmlFor="title"
              className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2"
            >
              PDF TITLE
            </label>
            <input
              type="text"
              name="title"
              className="text-[14px] w-full text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="e.g. Project Audit Report - January 2025"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              This will be used as the document title in the PDF
            </p>
          </div>

          <button className="w-full font-semibold text-white bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 duration-200 rounded-md py-2.5 px-3 disabled:opacity-60 disabled:cursor-not-allowed">
            Generate PDF
          </button>
        </form>
      </ContentCard>
    </div>
  );
}

