import { Report } from "./types";

interface Owner {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  // Add other owner fields as needed
}

interface Permissions {
  admin: boolean;
  maintain?: boolean;
  push: boolean;
  triage?: boolean;
  pull: boolean;
}

interface License {
  key: string;
  name: string;
  spdx_id: string;
  url: string | null;
  node_id: string;
}

export interface GithubRepository {
  db_id?: number; // Local DB ID, not from GitHub
  id: number;
  node_id: string;
  name: string;
  full_name: string;

  owner: Owner;

  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;

  // API URLs
  archive_url: string;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  deployments_url: string;
  downloads_url: string;
  events_url: string;
  forks_url: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  hooks_url: string;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  languages_url: string;
  merges_url: string;
  milestones_url: string;
  notifications_url: string;
  pulls_url: string;
  releases_url: string;
  stargazers_url: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  tags_url: string;
  teams_url: string;
  trees_url: string;

  // Git URLs
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  mirror_url: string | null;

  // Meta
  homepage: string | null;
  language: string | null;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  size: number;
  default_branch: string;
  open_issues_count: number;
  is_template: boolean;
  topics: string[];

  // Features
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;

  // Status
  archived: boolean;
  disabled: boolean;
  visibility: string;

  // Timestamps (GitHub returns these as ISO strings in JSON)
  pushed_at: string;
  created_at: string;
  updated_at: string;

  // Permissions
  permissions?: Permissions;

  // Merge settings
  allow_rebase_merge: boolean;
  allow_squash_merge: boolean;
  allow_auto_merge: boolean;
  delete_branch_on_merge: boolean;
  allow_merge_commit: boolean;

  // Additional info
  template_repository?: GithubRepository | null;
  temp_clone_token?: string | null;
  subscribers_count: number;
  network_count: number;
  license: License | null;
  forks: number;
  open_issues: number;
  watchers: number;

  // Might be added
  reports?: Report[];
}

