import { retryWithBackoff } from "./retry";

const METADATA_SERVICE_URL =
  "http://localhost:4000";

export interface MetadataResponse {
  url: string;
  title: string;
  description: string;
  fetchedAt: string;
  attemptCount: number;
}

export async function fetchMetadata(
  url: string
): Promise<MetadataResponse> {
  let attemptCount = 0;

  return retryWithBackoff(async () => {
    attemptCount += 1;

    const controller =
      new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);

    try {
      const response = await fetch(
        `${METADATA_SERVICE_URL}/metadata?url=${encodeURIComponent(
          url
        )}`,
        {
          signal: controller.signal,
        }
      );

      if (response.status === 429) {
        const error = new Error(
          "Rate limited"
        ) as Error & {
          retryAfterMs?: number;
        };

        const retryAfterSeconds = Number(
          response.headers.get(
            "Retry-After"
          ) ?? "1"
        );

        error.retryAfterMs =
          retryAfterSeconds * 1000;

        throw error;
      }

      if (response.status >= 500) {
        throw new Error(
          "Upstream service failure"
        );
      }

      if (!response.ok) {
        throw new Error(
          `Request failed: ${response.status}`
        );
      }

      const metadata =
        (await response.json()) as Omit<
          MetadataResponse,
          "attemptCount"
        >;

      return {
        ...metadata,
        attemptCount,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new Error(
          "Metadata request timed out"
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  });
}
