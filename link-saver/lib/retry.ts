type RetryableError = Error & {
  retryAfterMs?: number;
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    const retryDelay =
      typeof (
        error as RetryableError
      )?.retryAfterMs === "number"
        ? (
            error as RetryableError
          ).retryAfterMs!
        : delayMs;

    await new Promise((resolve) =>
      setTimeout(resolve, retryDelay)
    );

    return retryWithBackoff(
      fn,
      retries - 1,
      delayMs * 2
    );
  }
}
