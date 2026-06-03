export type LinkStatus =
  | "pending"
  | "fetching"
  | "done"
  | "failed";

export interface Link {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  status: LinkStatus;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}