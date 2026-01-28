"use client";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";

export default function WaitlistForm() {
  const [email, setEmail] = useState<string>("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email) return toast.error("Please fill your email!");

    const body = { email };
    const res = await fetch("/api/waitlist", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      try {
        const err = await res.json();
        return toast.error(err?.message || "An error occurred");
      } catch (error) {
        if (error instanceof Error) {
          return toast.error(error?.message || "An error occurred");
        }
        return toast.error("An error occurred");
      }
    }

    setEmail("");
    return toast.success("Joined Waitlist Successfully!");
  }

  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      className="flex items-center justify-center gap-4 bg-[#153057] w-fit mx-auto px-2 py-2 rounded-full shadow-[0_4px_8px_rgba(21,48,87,.8)] transition-all bg-clip-border bg-[url(/blue-mask.png)]"
    >
      <input
        type="email"
        placeholder="your.email@company.com"
        className="text-white placeholder:text-slate-300 focus:outline-none px-2.5 md:min-w-62.5"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
      <button className="cursor-pointer group w-full sm:w-auto flex gap-2 items-center justify-center py-2 px-5 rounded-full text-white text-lg font-medium bg-mask-clip-content bg-[url(/red-mask.png)] bg-position-[0_100%] hover:bg-position-[0_50%] transition-all shadow-xl shadow-red-600/15 overflow-hidden relative hover:shadow-red-600/40 duration-500">
        Join
      </button>
    </form>
  );
}

