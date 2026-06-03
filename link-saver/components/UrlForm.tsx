"use client";

import { useState } from "react";

type Props = {
  onLinkCreated: () => void;
};

export default function UrlForm({
  onLinkCreated,
}: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/links",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            url,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save link"
        );
      }

      setUrl("");

      onLinkCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label
            htmlFor="url"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Add a link
          </label>

          <input
            id="url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) =>
              setUrl(e.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-[54px] items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:transform-none disabled:bg-slate-400 disabled:shadow-none"
        >
          {loading
            ? "Saving..."
            : "Save Link"}
        </button>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
