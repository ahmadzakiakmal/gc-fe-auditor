"use client";
import { BookPlusIcon, ChevronDown, X } from "lucide-react";
import { FormEvent, useState } from "react";
import ContentCard from "../shared/ContentCard";
import { useSession } from "@/context/SessionContext";
import { cloneRepository } from "@/lib/api/data";
import { toast } from "react-toastify";

export default function NewRepo() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [repoUrl, setRepoUrl] = useState<string>("");
  const { ghRepos, isLoading, setIsLoading, refreshSession } = useSession();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await cloneRepository(repoUrl);
      console.log(response);
      toast.success("Success");
      setIsModalOpen(false);
      setRepoUrl("");
      refreshSession();
    } catch (error) {
      console.log(error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setRepoUrl(Array.isArray(ghRepos) ? ghRepos[0].html_url : "");
          setIsModalOpen(true);
        }}
        className="text-slate-700 text-sm dark:text-slate-300 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 duration-200 font-medium"
      >
        <BookPlusIcon size={18} /> <span>Add Repository</span>
      </button>

      <div className={`fixed inset-0 z-50 grid place-items-center ${isModalOpen ? "" : "hidden"}`}>
        <div
          onClick={() => setIsModalOpen(false)}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        ></div>

        <ContentCard className="relative z-10 w-[90%] max-w-[600px]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h1 className="font-semibold text-[20px] text-slate-700 dark:text-slate-200">Add New Repository</h1>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 duration-200"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="flex flex-col mb-4">
              <label
                htmlFor="repository"
                className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2"
              >
                SELECT REPOSITORY
              </label>
              <div className="relative">
                <select
                  name="repository"
                  className="w-full appearance-none text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 pl-3 pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  onChange={(e) => setRepoUrl(e.target.value)}
                  defaultValue={Array.isArray(ghRepos) ? ghRepos[0].html_url : ""}
                >
                  {ghRepos?.map((repo) => (
                    <option
                      className="bg-slate-50 dark:bg-slate-800"
                      key={repo.id}
                      value={repo.html_url}
                    >
                      {repo.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
                  <ChevronDown size={18} />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Select a repository from your GitHub account
              </p>
            </div>

            <button
              disabled={repoUrl === "" || isLoading}
              className="w-full font-semibold text-white bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 duration-200 rounded-md py-2.5 px-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Adding Repository..." : "Add Repository"}
            </button>
          </form>
        </ContentCard>
      </div>
    </>
  );
}

