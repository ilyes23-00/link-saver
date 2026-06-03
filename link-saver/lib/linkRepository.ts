import db from "./db";
import { Link } from "@/types/link";
import type { LinkStatus } from "@/types/link";

export function getAllLinks(): Link[] {
  return db
    .prepare(
      "SELECT * FROM links ORDER BY createdAt DESC"
    )
    .all() as Link[];
}

export function getLinkByUrl(
  url: string
): Link | undefined {
  return db
    .prepare(
      "SELECT * FROM links WHERE url = ?"
    )
    .get(url) as Link | undefined;
}

export function createLink(link: Link) {
  return db.prepare(`
    INSERT INTO links (
      id,
      url,
      title,
      description,
      status,
      error,
      createdAt,
      updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    link.id,
    link.url,
    link.title,
    link.description,
    link.status,
    link.error,
    link.createdAt,
    link.updatedAt
  );
}

export function updateLink(
  id: string,
  data: {
    title?: string | null;
    description?: string | null;
    status?: LinkStatus;
    error?: string | null;
  }
) {
  return db.prepare(`
    UPDATE links
    SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      error = COALESCE(?, error),
      updatedAt = ?
    WHERE id = ?
  `).run(
    data.title ?? null,
    data.description ?? null,
    data.status ?? null,
    data.error ?? null,
    new Date().toISOString(),
    id
  );
}
