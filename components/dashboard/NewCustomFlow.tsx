import { CheckSquare, Plus, Square, X } from "lucide-react";
import { useState, Dispatch, SetStateAction } from "react";
import ContentCard from "../shared/ContentCard";
import { Function } from "@/types/types";
import { createNewFlow } from "../../../lib/api/data";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "@/context/SessionContext";

export default function NewCustomFlow({ functions }: { functions: Function[] }) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFunctions, setSelectedFunctions] = useState<Function[]>([]);
  const [flowName, setFlowName] = useState<string>("");
  const { refreshSession } = useSession();
  const params = useParams();
  const repo_id = params.id;

  async function handleSubmit() {
    try {
      const response = await createNewFlow(repo_id as string, flowName, selectedFunctions);
      console.log(response);
      toast.success("Success");
      setIsModalOpen(false);
      refreshSession();
      setFlowName("");
      setSelectedFunctions([]);
    } catch (error) {
      console.log(error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="font-semibold text-slate-700 dark:text-slate-300 border border-slate-700 dark:border-slate-300 rounded-full aspect-square duration-200 p-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        <Plus size={16} />
      </button>

      <div className={`fixed inset-0 z-50 grid place-items-center ${isModalOpen ? "" : "hidden"}`}>
        <div
          onClick={() => setIsModalOpen(false)}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        ></div>

        <ContentCard className="relative z-10 w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h1 className="font-semibold text-[20px] text-slate-700 dark:text-slate-200">Add New Custom Flow</h1>
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
              if (flowName == "") {
                return toast.error("Flow Name cannot be empty");
              }
              if (selectedFunctions.length < 1) {
                return toast.error("Select at least one function");
              }
              handleSubmit();
            }}
          >
            <div className="flex flex-col mb-4">
              <label
                htmlFor="flow_name"
                className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2"
              >
                FLOW NAME
              </label>
              <input
                type="text"
                name="flow_name"
                className="text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="Enter flow name..."
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
              />
            </div>

            <div className="flex flex-col mb-4">
              <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                FUNCTIONS ({selectedFunctions.length} selected)
              </label>
              <div className="max-h-[250px] overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md space-y-1">
                {functions?.map((f) => {
                  return (
                    <FunctionCheckbox
                      key={f.function_signature}
                      f={f}
                      selectedFunctions={selectedFunctions}
                      setSelectedFunctions={setSelectedFunctions}
                    />
                  );
                })}
              </div>
            </div>

            <button
              className="w-full font-semibold text-white bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 duration-200 rounded-md py-2.5 px-3 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
            >
              Add Flow
            </button>
          </form>
        </ContentCard>
      </div>
    </>
  );
}

function FunctionCheckbox({
  f,
  selectedFunctions,
  setSelectedFunctions,
}: {
  f: Function;
  selectedFunctions: Function[];
  setSelectedFunctions: Dispatch<SetStateAction<Function[]>>;
}) {
  const active = selectedFunctions.includes(f);
  return (
    <div
      className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors group"
      title={f.function_signature}
      onClick={() => {
        if (active) {
          const newSelectedFunctions = selectedFunctions.filter((fn) => fn.function_signature !== f.function_signature);
          setSelectedFunctions(newSelectedFunctions);
          return;
        }
        setSelectedFunctions([...selectedFunctions, f]);
      }}
    >
      <div
        className={`shrink-0 ${active ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}`}
      >
        {active ? <CheckSquare size={18} /> : <Square size={18} />}
      </div>
      <div className="truncate text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 flex-1 font-family-firamono">
        {f.function_signature}
      </div>
    </div>
  );
}

