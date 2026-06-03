import { afterEach, describe, expect, it, vi } from "vitest";

import { retryWithBackoff } from "@/lib/retry";

describe("retryWithBackoff", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("honors retry-after style delays when present on an error", async () => {
    const waitSpy = vi
      .spyOn(global, "setTimeout")
      .mockImplementation((callback: TimerHandler) => {
        if (typeof callback === "function") {
          callback();
        }

        return 0 as ReturnType<typeof setTimeout>;
      });

    let attempts = 0;

    await expect(
      retryWithBackoff(async () => {
        attempts += 1;

        if (attempts === 1) {
          const error = new Error("Rate limited") as Error & {
            retryAfterMs?: number;
          };

          error.retryAfterMs = 2_000;
          throw error;
        }

        return "ok";
      })
    ).resolves.toBe("ok");

    expect(waitSpy).toHaveBeenCalledWith(
      expect.any(Function),
      2_000
    );
  });
});
