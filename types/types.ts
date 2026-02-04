// types/api.ts

import { GithubRepository } from "./github";

// ===== ENUMS (same) =====
export enum ReportStatus {
  QUEUE = "QUEUE",
  AI_REVIEW = "AI_REVIEW",
  AUDITOR_REVIEW = "AUDITOR_REVIEW",
  NEED_DEV_REMEDIATION = "NEED_DEV_REMEDIATION",
  DEV_REMEDIATED = "DEV_REMEDIATED",
  DONE = "DONE",
}

export enum FindingStatus {
  MITIGATION_CONFIRMED = "MITIGATION_CONFIRMED",
  PARTIALLY_MITIGATED = "PARTIALLY_MITIGATED",
  NOT_MITIGATED = "NOT_MITIGATED",
}

// ===== BASE INTERFACES (with serialized types) =====
export interface User {
  id: number;
  email: string | null;
  name: string | null;
  isAuditor: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface GithubAccount {
  id: number;
  userId: number;
  githubUserId: string; // bigint as string
  githubUsername: string;
  accessToken: string | null;
  connectedAt: string | null;
  updatedAt: string | null;
  installationId: string | null; // bigint as string
}

export interface Session {
  id: number;
  userId: number;
  expiryEpoch: string; // bigint as string
  sessionToken: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Repository {
  id: number;
  userId: number;
  url: string | null;
  isLocal: boolean;
}

export interface Report {
  id: number;
  repositoryId: number | null;
  url?: string;
  summary: string | null;
  status: ReportStatus;
  progress: number;
  paid: boolean;
  outOfScopeFiles: string[];
  created_at: string;
  findings: Finding[];
  username?: string;
  repo_url: string;
}

export interface Finding {
  id: number;
  title: string | null;
  code: string | null;
  severity: string | null;
  explanation: string | null;
  recommendation: string | null;
  reportId: number | null;
  isValid: boolean;
  status: FindingStatus;
  prId: number | null;
}

export interface ScanRequest {
  id: string; // UUID
  repoId: number;
  reportId: number;
  isBot: boolean;
}

export interface FlowFunction {
  id: number;
  customFlowId: number;
  filePath: string;
  func: string;
}

export interface CustomFlow {
  id: number;
  repoId: number;
  name: string | null;
}

export interface Code {
  id: number;
  reportId: number;
  code: string;
}

// ===== WITH RELATIONS (same structure as backend) =====
export interface RepositoryWithReports extends Repository {
  reports: Report[];
}

export interface ReportWithRepository extends Report {
  repositoryId: number;
  repositoryName: string;
}

export interface RepositoryWithGithubData extends Repository {
  githubData: GithubRepository;
}

