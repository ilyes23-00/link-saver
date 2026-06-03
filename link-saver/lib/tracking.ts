export function trackEvent(
  event: string,
  payload?: Record<string, unknown>
) {
  console.log(
    JSON.stringify({
      event,
      payload,
      timestamp:
        new Date().toISOString(),
    })
  );
}