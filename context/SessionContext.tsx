"use client";

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import { getAllReports, getDashboardData } from "../lib/api/data";
import { Report, User } from "@/types/types";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Define your session type
interface Session {
  user: User | null;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  isAuthenticated: boolean;
  reports: Report[] | null;
}

// Define context methods
interface SessionContextType extends Session {
  login: () => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

// Create context with undefined default
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Provider component
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session["user"]>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reports, setReports] = useState<Report[] | null>(null);
  const router = useRouter();

  // Fetch session on mount
  useEffect(() => {
    refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshSession = async () => {
    try {
      setIsLoading(true);

      const data = await getDashboardData();
      const user = data.user;
      setUser(user);

      const reports = await getAllReports();
      setReports(reports);
    } catch (error) {
      console.error("Failed to fetch session:", error);
      setUser(null);
      toast.error(error instanceof Error ? error.message : "An error occurred");
      if (error instanceof Error && error.message.toLowerCase().includes("unauthorized")) {
        router.replace("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {};

  const logout = () => {
    setUser(null);
    // TODO: Call logout endpoint
  };

  const value: SessionContextType = {
    user,
    isLoading,
    setIsLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshSession,
    reports,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

// Custom hook to use the session
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

