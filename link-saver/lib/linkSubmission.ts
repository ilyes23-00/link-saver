import { v4 as uuid } from "uuid";

import type { MetadataResponse } from "@/lib/metadata";
import type { Link, LinkStatus } from "@/types/link";

type LinkUpdate = {
  title?: string | null;
  description?: string | null;
  status?: LinkStatus;
  error?: string | null;
};

type SubmissionDependencies = {
  createLink: (link: Link) => unknown;
  fetchMetadata: (url: string) => Promise<MetadataResponse>;
  getLinkByUrl: (url: string) => Link | undefined;
  trackEvent: (
    event: string,
    payload?: Record<string, unknown>
  ) => void;
  updateLink: (
    id: string,
    data: LinkUpdate
  ) => unknown;
};

type SubmissionResult = {
  isDuplicate: boolean;
  link: Link;
};

function createPendingLink(url: string): Link {
  const timestamp =
    new Date().toISOString();

  return {
    id: uuid(),
    url,
    title: null,
    description: null,
    status: "pending",
    error: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function submitLink(
  url: string,
  dependencies: SubmissionDependencies
): SubmissionResult {
  const existing =
    dependencies.getLinkByUrl(url);

  if (existing) {
    dependencies.trackEvent(
      "link_submitted",
      {
        linkId: existing.id,
        url,
        deduped: true,
        status: existing.status,
      }
    );

    return {
      isDuplicate: true,
      link: existing,
    };
  }

  const link =
    createPendingLink(url);

  try {
    dependencies.createLink(link);
  } catch (error) {
    const duplicate =
      dependencies.getLinkByUrl(url);

    if (duplicate) {
      dependencies.trackEvent(
        "link_submitted",
        {
          linkId: duplicate.id,
          url,
          deduped: true,
          status: duplicate.status,
        }
      );

      return {
        isDuplicate: true,
        link: duplicate,
      };
    }

    throw error;
  }

  dependencies.trackEvent(
    "link_submitted",
    {
      linkId: link.id,
      url,
      deduped: false,
      status: link.status,
    }
  );

  return {
    isDuplicate: false,
    link,
  };
}

export async function processLink(
  link: Link,
  dependencies: SubmissionDependencies
) {
  const startedAt = Date.now();

  dependencies.updateLink(link.id, {
    status: "fetching",
    error: null,
  });

  try {
    const metadata =
      await dependencies.fetchMetadata(
        link.url
      );

    dependencies.updateLink(link.id, {
      title: metadata.title,
      description:
        metadata.description,
      status: "done",
      error: null,
    });

    dependencies.trackEvent(
      "link_processed",
      {
        linkId: link.id,
        url: link.url,
        status: "done",
        attemptCount:
          metadata.attemptCount,
        durationMs:
          Date.now() - startedAt,
      }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    dependencies.updateLink(link.id, {
      status: "failed",
      error: message,
    });

    dependencies.trackEvent(
      "metadata_fetch_failed",
      {
        linkId: link.id,
        url: link.url,
        status: "failed",
        error: message,
        durationMs:
          Date.now() - startedAt,
      }
    );
  }
}
