"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import UrlForm from "@/components/UrlForm";
import LinksTable from "@/components/LinksTable";
import type { LinkStatus } from "@/types/link";

type Link = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  status: LinkStatus;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function HomePage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] =
    useState(true);

  const loadLinks = useCallback(
    async () => {
      try {
        const response = await fetch(
          "/api/links"
        );

        const data =
          await response.json();

        setLinks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialLinks() {
      await loadLinks();

      if (cancelled) {
        return;
      }
    }

    void loadInitialLinks();

    return () => {
      cancelled = true;
    };
  }, [loadLinks]);

  useEffect(() => {
    const hasInFlightLinks = links.some(
      (link) =>
        link.status === "pending" ||
        link.status === "fetching"
    );

    if (!hasInFlightLinks) {
      return;
    }

    const intervalId =
      window.setInterval(() => {
        void loadLinks();
      }, 1500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [links, loadLinks]);

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-[var(--surface)] px-6 py-8 shadow-[var(--shadow)] backdrop-blur sm:px-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
                Smart bookmarking
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Link Saver
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                Save useful links, keep their metadata organized, and scan your
                collection without fighting low-contrast UI.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Total links
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {links.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Ready now
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {links.filter((link) => link.status === "done").length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-[1.75rem] border border-white/70 bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
          <UrlForm
            onLinkCreated={loadLinks}
          />
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-[var(--surface-strong)] p-4 shadow-[var(--shadow)] sm:p-6">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 py-16 text-center text-base font-medium text-slate-500">
              Loading links...
            </div>
          ) : (
            <LinksTable links={links} />
          )}
        </div>
      </div>
    </main>
  );
}
